import { LocationType } from "./location.entity";

export interface LocationRecommendationConstructor {
  id?: string;
  locationId?: string;
  coordHash: string;
  latitude: number;
  longitude: number;
  recommendedName: string;
  acceptedNames?: string[];
  enrichmentCount?: number;
  deliveryCount?: number;
  lastUsedAt?: Date;
  providerScore?: number;
  locationType?: LocationType;
  acceptedProvider?: string;
}

export class LocationRecommendation {
  readonly id: string;
  readonly locationId?: string;
  readonly coordHash: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly recommendedName: string;
  readonly acceptedNames: string[];
  readonly enrichmentCount: number;
  readonly deliveryCount: number;
  readonly lastUsedAt?: Date;
  readonly providerScore: number;
  readonly locationType?: LocationType;
  readonly acceptedProvider?: string;

  constructor(props: LocationRecommendationConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.coordHash = props.coordHash;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.recommendedName = props.recommendedName;
    this.acceptedNames = props.acceptedNames || [];
    this.enrichmentCount = props.enrichmentCount || 0;
    this.deliveryCount = props.deliveryCount || 0;
    this.lastUsedAt = props.lastUsedAt;
    this.providerScore = props.providerScore || 0;
    this.locationType = props.locationType;
    this.acceptedProvider = props.acceptedProvider;
  }
}
