import {
  IGeocodeProvider,
  AutocompleteRequest,
  ReverseGeocodeRequest,
} from "../../../domain/interfaces";
import { Place, PackManAddress } from "../../../domain/entities";
import { PlaceSource } from "../../../domain/entities";
import { config } from "../../config";
import { PhotonGeocodeMapper } from "./mappers/photon-geocode.mapper";

export class PhotonGeocodeProvider implements IGeocodeProvider {
  readonly name = "photon";
  private readonly mapper = new PhotonGeocodeMapper();

  private async fetch(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.geocodeProvider.photon.timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "PackManMapService/1.0" },
      });
      if (!res.ok) throw new Error(`Photon returned ${res.status}`);
      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async autocomplete(request: AutocompleteRequest): Promise<Place[]> {
    const url = new URL(`${config.geocodeProvider.photon.baseUrl}/api`);
    url.searchParams.set("q", request.query);
    url.searchParams.set("limit", String(request.limit || config.search.defaultLimit));
    if (request.lat != null && request.lng != null) {
      url.searchParams.set("lat", String(request.lat));
      url.searchParams.set("lon", String(request.lng));
    }
    url.searchParams.set("bbox", "33.0,3.0,48.0,15.0");

    const raw = await this.fetch(url.toString());
    return this.mapper.mapAutocomplete(raw, PlaceSource.PHOTON);
  }

  async reverseGeocode(request: ReverseGeocodeRequest): Promise<{
    address: PackManAddress;
    nearbyPlaces?: Place[];
  }> {
    const url = new URL(`${config.geocodeProvider.photon.baseUrl}/reverse`);
    url.searchParams.set("lat", String(request.coordinates.latitude));
    url.searchParams.set("lon", String(request.coordinates.longitude));

    const raw = await this.fetch(url.toString());
    const result = this.mapper.mapReverseGeocode(raw);
    return {
      address: result.address,
      nearbyPlaces: result.places,
    };
  }
}
