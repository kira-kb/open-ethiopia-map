import {
  IRecommendationEngine,
  RecommendationResult,
  ProviderMetadata,
} from "../../interfaces/recommendation-engine.interface";
import { LocationType } from "../../entities";

const PRIORITY_KEYS: Array<{ key: keyof ProviderMetadata; label: string }> = [
  { key: "officialName", label: "officialName" },
  { key: "buildingName", label: "buildingName" },
  { key: "mallName", label: "mallName" },
  { key: "hospitalName", label: "hospitalName" },
  { key: "schoolName", label: "schoolName" },
  { key: "hotelName", label: "hotelName" },
  { key: "businessName", label: "businessName" },
  { key: "roadName", label: "roadName" },
  { key: "landmark", label: "landmark" },
  { key: "district", label: "district" },
  { key: "subcity", label: "subcity" },
  { key: "city", label: "city" },
];

const PRIORITY_FOR_TYPE: Partial<Record<LocationType, Array<keyof ProviderMetadata>>> = {
  [LocationType.APARTMENT]: ["officialName", "buildingName", "roadName", "district", "subcity", "city"],
  [LocationType.CONDOMINIUM]: ["officialName", "buildingName", "roadName", "district", "subcity", "city"],
  [LocationType.HOUSE]: ["officialName", "houseNumber", "roadName", "landmark", "district", "subcity", "city"],
  [LocationType.VILLA]: ["officialName", "villaName", "roadName", "district", "subcity", "city"],
  [LocationType.OFFICE_BUILDING]: ["officialName", "buildingName", "roadName", "district", "subcity", "city"],
  [LocationType.SHOPPING_MALL]: ["officialName", "mallName", "roadName", "district", "subcity", "city"],
  [LocationType.HOTEL]: ["officialName", "hotelName", "roadName", "district", "subcity", "city"],
  [LocationType.HOSPITAL]: ["officialName", "hospitalName", "roadName", "district", "subcity", "city"],
  [LocationType.SCHOOL]: ["officialName", "schoolName", "roadName", "district", "subcity", "city"],
  [LocationType.UNIVERSITY]: ["officialName", "universityName", "roadName", "district", "subcity", "city"],
  [LocationType.RESTAURANT]: ["officialName", "restaurantName", "businessName", "roadName", "district", "subcity", "city"],
  [LocationType.INTERSECTION]: ["officialName", "roadA", "roadB", "landmark", "district", "subcity", "city"],
  [LocationType.SMART_LOCKER]: ["officialName", "lockerName", "roadName", "district", "subcity", "city"],
  [LocationType.BUS_STATION]: ["officialName", "stationName", "roadName", "landmark", "district", "subcity", "city"],
  [LocationType.AIRPORT]: ["officialName", "airportName", "roadName", "district", "subcity", "city"],
  [LocationType.LANDMARK]: ["officialName", "landmark", "roadName", "district", "subcity", "city"],
};

export class RecommendationEngine implements IRecommendationEngine {
  generate(
    metadata: ProviderMetadata,
    locationType?: LocationType,
  ): RecommendationResult {
    const keys = locationType && PRIORITY_FOR_TYPE[locationType]
      ? PRIORITY_FOR_TYPE[locationType]!.map((k) => ({
          key: k,
          label: k as string,
        }))
      : PRIORITY_KEYS;

    for (const { key } of keys) {
      const value = metadata[key as string];
      if (value && typeof value === "string" && value.trim().length > 0) {
        const confidence = this.calculateConfidence(key as string, value);
        return {
          recommendedName: value.trim(),
          confidence,
          locationType,
          sourceProvider: metadata.sourceProvider as string | undefined,
          providerMetadata: metadata,
        };
      }
    }

    const displayName = metadata.displayName;
    if (displayName && typeof displayName === "string" && displayName.trim().length > 0) {
      return {
        recommendedName: displayName.trim(),
        confidence: 0.3,
        locationType,
        sourceProvider: metadata.sourceProvider as string | undefined,
        providerMetadata: metadata,
      };
    }

    return {
      recommendedName: "Unknown Location",
      confidence: 0.1,
      locationType: LocationType.OTHER,
      providerMetadata: metadata,
    };
  }

  private calculateConfidence(key: string, _value: string): number {
    const confidenceMap: Record<string, number> = {
      officialName: 0.95,
      buildingName: 0.85,
      mallName: 0.85,
      hospitalName: 0.85,
      schoolName: 0.85,
      hotelName: 0.85,
      businessName: 0.75,
      roadName: 0.65,
      landmark: 0.60,
      district: 0.50,
      subcity: 0.40,
      city: 0.30,
      houseNumber: 0.70,
      villaName: 0.80,
      stationName: 0.80,
      airportName: 0.85,
      lockerName: 0.85,
      roadA: 0.60,
      roadB: 0.60,
    };
    return confidenceMap[key] ?? 0.5;
  }
}
