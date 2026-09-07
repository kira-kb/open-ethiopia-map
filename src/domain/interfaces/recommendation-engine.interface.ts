import { LocationType } from "../entities";

export interface RecommendationResult {
  recommendedName: string;
  confidence: number;
  locationType?: LocationType;
  sourceProvider?: string;
  providerMetadata?: Record<string, unknown>;
}

export interface ProviderMetadata {
  officialName?: string;
  buildingName?: string;
  mallName?: string;
  hospitalName?: string;
  schoolName?: string;
  hotelName?: string;
  businessName?: string;
  roadName?: string;
  landmark?: string;
  district?: string;
  subcity?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  displayName?: string;
  [key: string]: unknown;
}

export interface IRecommendationEngine {
  generate(metadata: ProviderMetadata, locationType?: LocationType): RecommendationResult;
}
