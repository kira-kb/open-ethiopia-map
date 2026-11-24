import { Coordinates, RouteProfile } from "../../value-objects";

export type EthiopianCity = "addis_ababa" | "gondar" | "hawassa" | "bahir_dar" | "adama" | "other";

export interface CityValidationResult {
  city: EthiopianCity;
  isLegalProfile: boolean;
  warning?: string;
  suggestedProfile?: RouteProfile;
}

export class CityGuard {
  // Bounding Boxes for major operational regions
  private static readonly ADDIS_CENTRAL_BBOX = {
    minLat: 8.950,
    maxLat: 9.070,
    minLng: 38.700,
    maxLng: 38.850,
  };

  private static readonly GONDAR_METRO_BBOX = {
    minLat: 12.480,
    maxLat: 12.680,
    minLng: 37.380,
    maxLng: 37.560,
  };

  detectCity(coord: Coordinates): EthiopianCity {
    const lat = coord.latitude;
    const lng = coord.longitude;

    if (
      lat >= CityGuard.ADDIS_CENTRAL_BBOX.minLat &&
      lat <= CityGuard.ADDIS_CENTRAL_BBOX.maxLat &&
      lng >= CityGuard.ADDIS_CENTRAL_BBOX.minLng &&
      lng <= CityGuard.ADDIS_CENTRAL_BBOX.maxLng
    ) {
      return "addis_ababa";
    }

    if (
      lat >= CityGuard.GONDAR_METRO_BBOX.minLat &&
      lat <= CityGuard.GONDAR_METRO_BBOX.maxLat &&
      lng >= CityGuard.GONDAR_METRO_BBOX.minLng &&
      lng <= CityGuard.GONDAR_METRO_BBOX.maxLng
    ) {
      return "gondar";
    }

    return "other";
  }

  validateProfileForRegion(origin: Coordinates, destination: Coordinates, profile: RouteProfile): CityValidationResult {
    const originCity = this.detectCity(origin);
    const destCity = this.detectCity(destination);
    const city = originCity === destCity ? originCity : "other";

    // ── Addis Ababa Bajaj Ban Rule ──────────────────────────────────
    // Bajaj (three-wheelers) are legally prohibited on central expressways & subcities in Addis Ababa
    if ((originCity === "addis_ababa" || destCity === "addis_ababa") && profile === RouteProfile.BAJAJ) {
      return {
        city: "addis_ababa",
        isLegalProfile: false,
        warning: "Bajaj (three-wheelers) are legally restricted in central Addis Ababa. Consider motorcycle or car.",
        suggestedProfile: RouteProfile.MOTORCYCLE,
      };
    }

    // ── Gondar Unrestricted Bajaj Rule ─────────────────────────────
    if (city === "gondar") {
      return {
        city: "gondar",
        isLegalProfile: true,
      };
    }

    return {
      city,
      isLegalProfile: true,
    };
  }
}
