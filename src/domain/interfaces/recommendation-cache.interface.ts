import { LocationType } from "../entities/location.entity";

export interface CachedRecommendation {
  coordHash: string;
  latitude: number;
  longitude: number;
  recommendedName: string;
  acceptedNames: string[];
  enrichmentCount: number;
  deliveryCount: number;
  lastUsedAt?: Date;
  providerScore: number;
  locationType?: LocationType;
  acceptedProvider?: string;
}

export interface IRecommendationCache {
  get(hash: string): Promise<CachedRecommendation | null>;
  set(rec: CachedRecommendation): Promise<void>;
  recordEnrichment(hash: string, acceptedName: string, isEdit: boolean): Promise<void>;
  recordDelivery(hash: string): Promise<void>;
  findNearby(lat: number, lng: number, radiusMeters?: number): Promise<CachedRecommendation[]>;
}
