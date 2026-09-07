import { Coordinates } from "../value-objects";
import { Place } from "../entities";

export interface AutocompleteRequest {
  query: string;
  limit?: number;
  lat?: number;
  lng?: number;
  city?: string;
  categories?: string;
}

export interface ReverseGeocodeRequest {
  coordinates: Coordinates;
  radius?: number;
}

export interface IGeocodeProvider {
  readonly name: string;
  autocomplete(request: AutocompleteRequest): Promise<Place[]>;
  reverseGeocode(request: ReverseGeocodeRequest): Promise<{
    address: import("../entities").PackManAddress;
    nearbyPlaces?: Place[];
  }>;
}
