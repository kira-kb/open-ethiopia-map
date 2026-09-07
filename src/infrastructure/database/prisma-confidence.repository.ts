import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../node_modules/.prisma/map-client";
import { ILocationConfidenceRepository } from "../../domain/entities/location-enrichment-repository.interface";
import {
  LocationConfidence,
  LocationConfidenceConstructor,
  ConfidenceLevel,
} from "../../domain/entities/location-confidence.entity";
import { Logger } from "../../domain/interfaces";
import { config } from "../config";

export class PrismaLocationConfidenceRepository implements ILocationConfidenceRepository {
  private prisma: PrismaClient;

  constructor(private readonly logger: Logger) {
    const dbUrl = config.database.url;
    if (!dbUrl) {
      throw new Error("MAP_DATABASE_URL is not set.");
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    this.prisma = new PrismaClient({ adapter });
  }

  async findByCoordHash(coordHash: string): Promise<LocationConfidence | null> {
    const row = await this.prisma.locationConfidence.findUnique({
      where: { coordHash },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByPlaceId(placeId: string): Promise<LocationConfidence | null> {
    const row = await this.prisma.locationConfidence.findFirst({
      where: { locationId: placeId },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async save(confidence: LocationConfidence): Promise<LocationConfidence> {
    const row = await this.prisma.locationConfidence.upsert({
      where: { coordHash: confidence.coordHash },
      create: {
        locationId: confidence.locationId || undefined,
        coordHash: confidence.coordHash,
        successfulDeliveries: confidence.successfulDeliveries,
        failedDeliveries: confidence.failedDeliveries,
        driverCorrections: confidence.driverCorrections,
        driverHelpRequests: confidence.driverHelpRequests,
        successfulFirstAttempt: confidence.successfulFirstAttempt,
        customerCorrections: confidence.customerCorrections,
        confirmationCount: confidence.confirmationCount,
        editCount: confidence.editCount,
        confidenceScore: confidence.confidenceScore,
        confidenceLevel: confidence.confidenceLevel as any,
        lastSuccessfulDelivery: confidence.lastSuccessfulDelivery,
        lastConfirmedAt: confidence.lastConfirmedAt,
      },
      update: {
        successfulDeliveries: confidence.successfulDeliveries,
        failedDeliveries: confidence.failedDeliveries,
        driverCorrections: confidence.driverCorrections,
        driverHelpRequests: confidence.driverHelpRequests,
        successfulFirstAttempt: confidence.successfulFirstAttempt,
        customerCorrections: confidence.customerCorrections,
        confirmationCount: confidence.confirmationCount,
        editCount: confidence.editCount,
        confidenceScore: confidence.confidenceScore,
        confidenceLevel: confidence.confidenceLevel as any,
        lastSuccessfulDelivery: confidence.lastSuccessfulDelivery,
        lastConfirmedAt: confidence.lastConfirmedAt,
      },
    });

    this.logger.info("Location confidence saved to DB", { coordHash: row.coordHash, score: row.confidenceScore });
    return this.toEntity(row);
  }

  async upsertByCoordHash(
    coordHash: string,
    data: Partial<LocationConfidenceConstructor>,
  ): Promise<LocationConfidence> {
    const existing = await this.findByCoordHash(coordHash);
    if (existing) {
      const updated = new LocationConfidence({
        ...existing,
        ...data,
        coordHash,
      });
      return this.save(updated);
    }
    const created = new LocationConfidence({
      coordHash,
      ...data,
    });
    return this.save(created);
  }

  private toEntity(row: any): LocationConfidence {
    return new LocationConfidence({
      id: row.id,
      locationId: row.locationId || undefined,
      coordHash: row.coordHash,
      successfulDeliveries: row.successfulDeliveries,
      failedDeliveries: row.failedDeliveries,
      driverCorrections: row.driverCorrections,
      driverHelpRequests: row.driverHelpRequests,
      successfulFirstAttempt: row.successfulFirstAttempt,
      customerCorrections: row.customerCorrections,
      confirmationCount: row.confirmationCount,
      editCount: row.editCount,
      confidenceScore: row.confidenceScore,
      confidenceLevel: row.confidenceLevel as ConfidenceLevel,
      lastSuccessfulDelivery: row.lastSuccessfulDelivery || undefined,
      lastConfirmedAt: row.lastConfirmedAt || undefined,
      lastUpdatedAt: row.lastUpdatedAt,
      createdAt: row.createdAt,
    });
  }
}
