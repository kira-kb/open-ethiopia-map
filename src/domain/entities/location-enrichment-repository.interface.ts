import { LocationEnrichment } from "./location-enrichment.entity";
import { LocationConfidence, LocationConfidenceConstructor } from "./location-confidence.entity";

export interface ILocationEnrichmentRepository {
  save(enrichment: LocationEnrichment): Promise<LocationEnrichment>;
  findByCoordHash(coordHash: string): Promise<LocationEnrichment[]>;
  findByUser(userId: string): Promise<LocationEnrichment[]>;
}

export interface ILocationConfidenceRepository {
  findByCoordHash(coordHash: string): Promise<LocationConfidence | null>;
  findByPlaceId(placeId: string): Promise<LocationConfidence | null>;
  save(confidence: LocationConfidence): Promise<LocationConfidence>;
  upsertByCoordHash(coordHash: string, data: Partial<LocationConfidenceConstructor>): Promise<LocationConfidence>;
}
