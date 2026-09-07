import { Place, LocationType } from "../entities";

export interface SearchOptions {
  query: string;
  limit?: number;
  city?: string;
  lat?: number;
  lng?: number;
  categories?: string[];
  locationTypes?: LocationType[];
  userId?: string;
}

export interface NearbyOptions {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  limit?: number;
  category?: string;
  locationType?: LocationType;
}

export interface SavedPlaceRecord {
  id: string;
  userId: string;
  label: string;
  name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  city?: string;
  locationType?: LocationType;
  extraDetails?: Record<string, unknown>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlaceRepository {
  findById(id: string): Promise<Place | null>;
  search(options: SearchOptions): Promise<Place[]>;
  findNearby(options: NearbyOptions): Promise<Place[]>;
  findByCoordinates(lat: number, lng: number, radiusMeters?: number): Promise<Place | null>;
  save(place: Place): Promise<Place>;
  upsertMany(places: Place[]): Promise<Place[]>;
  incrementSearchCount(id: string): Promise<void>;
  incrementSelectionCount(id: string): Promise<void>;
  recordConfirmation(id: string, acceptedName: string): Promise<void>;
  delete(id: string): Promise<void>;
  findSavedPlaces(userId: string): Promise<SavedPlaceRecord[]>;
  saveSavedPlace(record: Omit<SavedPlaceRecord, "id" | "createdAt" | "updatedAt">): Promise<SavedPlaceRecord>;
  updateSavedPlace(userId: string, placeId: string, data: Partial<Pick<SavedPlaceRecord, "label" | "name" | "address" | "locationType" | "extraDetails" | "city" | "latitude" | "longitude">>): Promise<SavedPlaceRecord>;
  deleteSavedPlace(userId: string, placeId: string): Promise<void>;
}
