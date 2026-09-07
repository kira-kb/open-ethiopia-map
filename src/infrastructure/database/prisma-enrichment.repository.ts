import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../node_modules/.prisma/map-client";
import { ILocationEnrichmentRepository } from "../../domain/entities/location-enrichment-repository.interface";
import { LocationEnrichment } from "../../domain/entities/location-enrichment.entity";
import { Logger } from "../../domain/interfaces";
import { config } from "../config";

export class PrismaLocationEnrichmentRepository implements ILocationEnrichmentRepository {
  private prisma: PrismaClient;

  constructor(private readonly logger: Logger) {
    const dbUrl = config.database.url;
    if (!dbUrl) {
      throw new Error("MAP_DATABASE_URL is not set.");
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    this.prisma = new PrismaClient({ adapter });
  }

  async save(enr: LocationEnrichment): Promise<LocationEnrichment> {
    const row = await this.prisma.locationEnrichment.create({
      data: {
        locationId: enr.locationId || undefined,
        userId: enr.userId || undefined,
        suggestedName: enr.suggestedName || undefined,
        finalName: enr.finalName,
        locationType: enr.locationType as any,
        extraDetails: enr.extraDetails as any,
        latitude: enr.latitude,
        longitude: enr.longitude,
        coordHash: enr.coordHash,
        savePlace: enr.savePlace,
        savedLabel: enr.savedLabel || undefined,
        sourceProvider: enr.sourceProvider || undefined,
      },
    });

    this.logger.info("Location enrichment persisted to database", { id: row.id, coordHash: row.coordHash });

    return new LocationEnrichment({
      id: row.id,
      locationId: row.locationId || undefined,
      userId: row.userId || undefined,
      suggestedName: row.suggestedName || undefined,
      finalName: row.finalName,
      locationType: row.locationType || undefined,
      extraDetails: row.extraDetails ? (row.extraDetails as any) : {},
      latitude: row.latitude,
      longitude: row.longitude,
      coordHash: row.coordHash,
      savePlace: row.savePlace,
      savedLabel: row.savedLabel || undefined,
      sourceProvider: row.sourceProvider || undefined,
      createdAt: row.createdAt,
    });
  }

  async findByCoordHash(coordHash: string): Promise<LocationEnrichment[]> {
    const rows = await this.prisma.locationEnrichment.findMany({
      where: { coordHash },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(
      (row) =>
        new LocationEnrichment({
          id: row.id,
          locationId: row.locationId || undefined,
          userId: row.userId || undefined,
          suggestedName: row.suggestedName || undefined,
          finalName: row.finalName,
          locationType: row.locationType || undefined,
          extraDetails: row.extraDetails ? (row.extraDetails as any) : {},
          latitude: row.latitude,
          longitude: row.longitude,
          coordHash: row.coordHash,
          savePlace: row.savePlace,
          savedLabel: row.savedLabel || undefined,
          sourceProvider: row.sourceProvider || undefined,
          createdAt: row.createdAt,
        }),
    );
  }

  async findByUser(userId: string): Promise<LocationEnrichment[]> {
    const rows = await this.prisma.locationEnrichment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(
      (row) =>
        new LocationEnrichment({
          id: row.id,
          locationId: row.locationId || undefined,
          userId: row.userId || undefined,
          suggestedName: row.suggestedName || undefined,
          finalName: row.finalName,
          locationType: row.locationType || undefined,
          extraDetails: row.extraDetails ? (row.extraDetails as any) : {},
          latitude: row.latitude,
          longitude: row.longitude,
          coordHash: row.coordHash,
          savePlace: row.savePlace,
          savedLabel: row.savedLabel || undefined,
          sourceProvider: row.sourceProvider || undefined,
          createdAt: row.createdAt,
        }),
    );
  }
}
