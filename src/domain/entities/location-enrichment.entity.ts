export type EnrichmentExtraDetails = {
  building?: string;
  buildingNumber?: string;
  block?: string;
  floor?: string;
  unit?: string;
  unitNumber?: string;
  office?: string;
  officeNumber?: string;
  wing?: string;
  gate?: string;
  gateColor?: string;
  entrance?: string;
  landmark?: string;
  nearestLandmark?: string;
  notes?: string;
  tower?: string;
  campus?: string;
  department?: string;
  receptionName?: string;
  compoundName?: string;
  warehouseNumber?: string;
  loadingGate?: string;
  dock?: string;
  classBlock?: string;
  elevatorAvailable?: string;
  [key: string]: unknown;
};

export interface LocationEnrichmentConstructor {
  id?: string;
  locationId?: string;
  placeId?: string;
  userId?: string;
  suggestedName?: string;
  finalName: string;
  locationType?: string;
  extraDetails?: EnrichmentExtraDetails;
  latitude: number;
  longitude: number;
  coordHash: string;
  savePlace?: boolean;
  savedLabel?: string;
  sourceProvider?: string;
  createdAt?: Date;
}

export class LocationEnrichment {
  readonly id: string;
  readonly locationId?: string;
  readonly placeId?: string;
  readonly userId?: string;
  readonly suggestedName?: string;
  readonly finalName: string;
  readonly locationType?: string;
  readonly extraDetails: EnrichmentExtraDetails;
  readonly latitude: number;
  readonly longitude: number;
  readonly coordHash: string;
  readonly savePlace: boolean;
  readonly savedLabel?: string;
  readonly sourceProvider?: string;
  readonly createdAt: Date;

  constructor(props: LocationEnrichmentConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.placeId = props.placeId;
    this.userId = props.userId;
    this.suggestedName = props.suggestedName;
    this.finalName = props.finalName;
    this.locationType = props.locationType;
    this.extraDetails = props.extraDetails || {};
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.coordHash = props.coordHash;
    this.savePlace = props.savePlace || false;
    this.savedLabel = props.savedLabel;
    this.sourceProvider = props.sourceProvider;
    this.createdAt = props.createdAt || new Date();
  }
}
