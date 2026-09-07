import { PlaceSource } from "./place.entity";

export interface LocationProviderRecordConstructor {
  id?: string;
  locationId: string;
  source: PlaceSource;
  providerPlaceId?: string;
  providerName?: string;
  providerMetadata?: Record<string, unknown>;
}

export class LocationProviderRecord {
  readonly id: string;
  readonly locationId: string;
  readonly source: PlaceSource;
  readonly providerPlaceId?: string;
  readonly providerName?: string;
  readonly providerMetadata?: Record<string, unknown>;
  readonly importedAt: Date;

  constructor(props: LocationProviderRecordConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.source = props.source;
    this.providerPlaceId = props.providerPlaceId;
    this.providerName = props.providerName;
    this.providerMetadata = props.providerMetadata;
    this.importedAt = new Date();
  }
}
