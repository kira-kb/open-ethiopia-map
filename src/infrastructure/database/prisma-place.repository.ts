import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../node_modules/.prisma/map-client";

import {
  IPlaceRepository,
  SearchOptions,
  NearbyOptions,
  SavedPlaceRecord,
} from "../../domain/interfaces";
import { Place, PlaceSource, LocationType } from "../../domain/entities";
import { Logger } from "../../domain/interfaces";
import { config } from "../config";

export class PrismaPlaceRepository implements IPlaceRepository {
  private prisma: PrismaClient;

  constructor(
    private readonly logger: Logger,
  ) {
    const dbUrl = config.database.url;
    if (!dbUrl) {
      throw new Error("MAP_DATABASE_URL is not set. Map service requires its own database.");
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    this.prisma = new PrismaClient({ adapter });
  }

  async findById(id: string): Promise<Place | null> {
    const row = await this.prisma.place.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async search(options: SearchOptions): Promise<Place[]> {
    const q = options.query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const limit = Math.min(options.limit || 8, 25);
    const likePattern = `%${q}%`;

    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "Place"
       WHERE "normalizedName" ILIKE $1
          OR EXISTS (SELECT 1 FROM unnest("aliases") AS a WHERE a ILIKE $1)
          OR to_tsvector('simple', "normalizedName") @@ plainto_tsquery('simple', $2)
       ORDER BY
          CASE WHEN LOWER("normalizedName") = $2 THEN 0 ELSE 1 END,
          "recommendationConfidence" DESC,
          "confidence" DESC,
          "popularity" DESC,
          "searchCount" DESC,
          "selectionCount" DESC
       LIMIT $3`,
      likePattern,
      q,
      limit,
    );

    return rows.map((r) => this.toDomain(r));
  }

  async findNearby(options: NearbyOptions): Promise<Place[]> {
    const limit = options.limit || 20;

    let whereClause = "1=1";
    const params: unknown[] = [options.latitude, options.longitude, options.radiusMeters, limit];

    if (options.category) {
      whereClause += ` AND "category" = $5`;
      params.push(options.category);
    }

    if (options.locationType) {
      const paramIdx = params.length + 1;
      whereClause += ` AND "locationType" = $${paramIdx}::"LocationType"`;
      params.push(options.locationType);
    }

    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT *,
         (6371000 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS("latitude" - $1) / 2), 2) +
           COS(RADIANS($1)) * COS(RADIANS("latitude")) *
           POWER(SIN(RADIANS("longitude" - $2) / 2), 2)
         ))) AS distance
       FROM "Place"
       WHERE ${whereClause}
         AND (6371000 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS("latitude" - $1) / 2), 2) +
           COS(RADIANS($1)) * COS(RADIANS("latitude")) *
           POWER(SIN(RADIANS("longitude" - $2) / 2), 2)
         ))) <= $3
       ORDER BY distance ASC
       LIMIT $4`,
      ...params,
    );

    return rows.map((r) => this.toDomain(r));
  }

  async findByCoordinates(
    lat: number,
    lng: number,
    radiusMeters = 50,
  ): Promise<Place | null> {
    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT *,
         (6371000 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS("latitude" - $1) / 2), 2) +
           COS(RADIANS($1)) * COS(RADIANS("latitude")) *
           POWER(SIN(RADIANS("longitude" - $2) / 2), 2)
         ))) AS distance
       FROM "Place"
       WHERE (6371000 * 2 * ASIN(SQRT(
           POWER(SIN(RADIANS("latitude" - $1) / 2), 2) +
           COS(RADIANS($1)) * COS(RADIANS("latitude")) *
           POWER(SIN(RADIANS("longitude" - $2) / 2), 2)
         ))) <= $3
       ORDER BY distance ASC
       LIMIT 1`,
      lat,
      lng,
      radiusMeters,
    );
    return rows.length ? this.toDomain(rows[0]) : null;
  }

  async save(place: Place): Promise<Place> {
    const data = this.toPrisma(place);
    const row = await this.prisma.place.upsert({
      where: { id: place.id || "__new__" },
      update: data as never,
      create: data as never,
    });
    return this.toDomain(row as unknown as Record<string, unknown>);
  }

  async upsertMany(places: Place[]): Promise<Place[]> {
    const results: Place[] = [];
    for (const place of places) {
      try {
        const existing = await this.findByCoordinates(place.latitude, place.longitude, 50);
        if (existing) {
          const merged = new Place({
            ...existing.toPlain(),
            name: place.name || existing.name,
            aliases: [...new Set([...existing.aliases, ...place.aliases])],
            source: place.source as PlaceSource,
            locationType: place.locationType || existing.locationType,
            confidence: Math.max(existing.confidence, place.confidence),
            searchCount: existing.searchCount + 1,
            providerMetadata: place.providerMetadata || existing.providerMetadata,
          });
          results.push(await this.save(merged));
        } else {
          results.push(await this.save(place));
        }
      } catch (err) {
        this.logger.warn("Failed to upsert place", {
          name: place.name,
          error: (err as Error).message,
        });
      }
    }
    return results;
  }

  async incrementSearchCount(id: string): Promise<void> {
    await this.prisma.place.update({
      where: { id },
      data: { searchCount: { increment: 1 } },
    });
  }

  async incrementSelectionCount(id: string): Promise<void> {
    await this.prisma.place.update({
      where: { id },
      data: { selectionCount: { increment: 1 } },
    });
  }

  async recordConfirmation(id: string, acceptedName: string): Promise<void> {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) return;

    const p = place as unknown as Record<string, unknown>;
    const dbName = (p.displayName || p.officialName || p.name) as string;
    const nameChanged = acceptedName !== dbName;

    await this.prisma.place.update({
      where: { id },
      data: {
        confirmationCount: { increment: nameChanged ? 0 : 1 },
        editCount: { increment: nameChanged ? 1 : 0 },
        lastConfirmedAt: new Date(),
        lastEditedAt: nameChanged ? new Date() : place.lastEditedAt,
        recommendationConfidence: nameChanged
          ? Math.max(0, (place.recommendationConfidence || 0) - 0.1)
          : Math.min(1, (place.recommendationConfidence || 0) + 0.05),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.place.delete({ where: { id } });
  }

  async findSavedPlaces(userId: string): Promise<SavedPlaceRecord[]> {
    const rows = await this.prisma.savedPlace.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      label: r.label,
      name: r.name || undefined,
      address: r.address || undefined,
      latitude: r.latitude,
      longitude: r.longitude,
      city: r.city || undefined,
      locationType: r.locationType as LocationType | undefined,
      extraDetails: r.extraDetails ? (r.extraDetails as Record<string, unknown>) : undefined,
      isDefault: r.isDefault,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async saveSavedPlace(record: Omit<SavedPlaceRecord, "id" | "createdAt" | "updatedAt">): Promise<SavedPlaceRecord> {
    const row = await this.prisma.savedPlace.create({
      data: {
        userId: record.userId,
        label: record.label,
        name: record.name,
        address: record.address,
        latitude: record.latitude,
        longitude: record.longitude,
        city: record.city,
        locationType: record.locationType as never,
        extraDetails: record.extraDetails as never,
        isDefault: record.isDefault,
      },
    });

    return {
      id: row.id,
      userId: row.userId,
      label: row.label,
      name: row.name || undefined,
      address: row.address || undefined,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city || undefined,
      locationType: row.locationType as LocationType | undefined,
      extraDetails: row.extraDetails ? (row.extraDetails as Record<string, unknown>) : undefined,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async updateSavedPlace(userId: string, placeId: string, data: Partial<Pick<SavedPlaceRecord, "label" | "name" | "address" | "locationType" | "extraDetails" | "city" | "latitude" | "longitude">>): Promise<SavedPlaceRecord> {
    const row = await this.prisma.savedPlace.update({
      where: { id: placeId },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.locationType !== undefined && { locationType: data.locationType as never }),
        ...(data.extraDetails !== undefined && { extraDetails: data.extraDetails as never }),
      },
    });

    return {
      id: row.id,
      userId: row.userId,
      label: row.label,
      name: row.name || undefined,
      address: row.address || undefined,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city || undefined,
      locationType: row.locationType as LocationType | undefined,
      extraDetails: row.extraDetails ? (row.extraDetails as Record<string, unknown>) : undefined,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteSavedPlace(userId: string, placeId: string): Promise<void> {
    await this.prisma.savedPlace.updateMany({
      where: { id: placeId, userId },
      data: { deletedAt: new Date() },
    });
  }

  private toDomain(row: Record<string, unknown>): Place {
    let providerMetadata: Record<string, unknown> | undefined;
    if (row.providerMetadata) {
      try {
        providerMetadata = row.providerMetadata as Record<string, unknown>;
      } catch {
        providerMetadata = undefined;
      }
    }

    return new Place({
      id: row.id as string,
      officialName: (row.officialName as string) || undefined,
      displayName: (row.displayName as string) || undefined,
      shortName: (row.shortName as string) || undefined,
      name: row.name as string,
      normalizedName: row.normalizedName as string,
      aliases: (row.aliases as string[]) || [],
      formattedAddress: (row.formattedAddress as string) || undefined,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      street: (row.street as string) || undefined,
      houseNumber: (row.houseNumber as string) || undefined,
      building: (row.building as string) || undefined,
      block: (row.block as string) || undefined,
      floor: (row.floor as string) || undefined,
      unit: (row.unit as string) || undefined,
      district: (row.district as string) || undefined,
      subcity: (row.subcity as string) || undefined,
      city: (row.city as string) || undefined,
      region: (row.region as string) || undefined,
      country: (row.country as string) || "Ethiopia",
      postalCode: (row.postalCode as string) || undefined,
      locationType: (row.locationType as LocationType) || undefined,
      category: (row.category as string) || undefined,
      subcategory: (row.subcategory as string) || undefined,
      source: (row.source as PlaceSource) || PlaceSource.PACKMAN,
      providerPlaceId: (row.providerPlaceId as string) || undefined,
      providerMetadata,
      popularity: Number(row.popularity || 0),
      confidence: Number(row.confidence || 0),
      searchCount: Number(row.searchCount || 0),
      selectionCount: Number(row.selectionCount || 0),
      verified: Boolean(row.verified),
      recommendationConfidence: Number(row.recommendationConfidence || 0),
      recommendationCount: Number(row.recommendationCount || 0),
      confirmationCount: Number(row.confirmationCount || 0),
      editCount: Number(row.editCount || 0),
      lastConfirmedAt: row.lastConfirmedAt ? new Date(row.lastConfirmedAt as string) : undefined,
      lastEditedAt: row.lastEditedAt ? new Date(row.lastEditedAt as string) : undefined,
      sourceProvider: (row.sourceProvider as string) || undefined,
      metadata: row.metadata ? (row.metadata as Record<string, unknown>) : {},
    });
  }

  private toPrisma(place: Place): Record<string, unknown> {
    return {
      id: place.id || undefined,
      officialName: place.officialName || null,
      displayName: place.displayName || null,
      shortName: place.shortName || null,
      name: place.name,
      normalizedName: place.normalizedName,
      aliases: place.aliases,
      formattedAddress: place.formattedAddress || null,
      latitude: place.latitude,
      longitude: place.longitude,
      street: place.street || null,
      houseNumber: place.houseNumber || null,
      building: place.building || null,
      block: place.block || null,
      floor: place.floor || null,
      unit: place.unit || null,
      district: place.district || null,
      subcity: place.subcity || null,
      city: place.city || null,
      region: place.region || null,
      country: place.country,
      postalCode: place.postalCode || null,
      locationType: place.locationType || null,
      category: place.category || null,
      subcategory: place.subcategory || null,
      source: place.source,
      providerPlaceId: place.providerPlaceId || null,
      providerMetadata: place.providerMetadata || null,
      popularity: place.popularity,
      confidence: place.confidence,
      searchCount: place.searchCount,
      selectionCount: place.selectionCount,
      verified: place.verified,
      recommendationConfidence: place.recommendationConfidence,
      recommendationCount: place.recommendationCount,
      confirmationCount: place.confirmationCount,
      editCount: place.editCount,
      lastConfirmedAt: place.lastConfirmedAt || null,
      lastEditedAt: place.lastEditedAt || null,
      sourceProvider: place.sourceProvider || null,
      metadata: place.metadata || null,
    };
  }
}
