import {
  Place,
  PlaceSource,
  LocationType,
} from "../../../../domain/entities";

interface PhotonFeature {
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    extent?: [number, number, number, number];
    country?: string;
    city?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    name: string;
    osm_key?: string;
    osm_value?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function mapOsmValueToLocationType(osmValue?: string, osmKey?: string): LocationType | undefined {
  const map: Record<string, LocationType> = {
    hotel: LocationType.HOTEL,
    restaurant: LocationType.RESTAURANT,
    hospital: LocationType.HOSPITAL,
    university: LocationType.UNIVERSITY,
    school: LocationType.SCHOOL,
    mall: LocationType.SHOPPING_MALL,
    fuel: LocationType.FUEL_STATION,
    bank: LocationType.BANK,
    pharmacy: LocationType.PHARMACY,
    bus_station: LocationType.BUS_STATION,
    airport: LocationType.AIRPORT,
    parking: LocationType.PARKING,
    office: LocationType.OFFICE_BUILDING,
  };
  return (osmValue && map[osmValue.toLowerCase()]) || undefined;
}

function osmValueToCategory(osmValue?: string, osmKey?: string): string | undefined {
  if (!osmValue) return undefined;
  return osmKey ? `${osmKey}.${osmValue}` : osmValue;
}

export class PhotonGeocodeMapper {
  mapAutocomplete(raw: unknown, source: PlaceSource): Place[] {
    const response = raw as PhotonResponse;
    if (!response.features?.length) return [];

    return response.features.map((f) => {
      const props = f.properties;
      const coords = f.geometry.coordinates;
      const name = props.name || `${props.street || ""} ${props.housenumber || ""}`.trim() || "Unknown";

      const buildingName = props.osm_value === "hotel" ? props.name
        : props.osm_value === "mall" ? props.name
        : props.osm_value === "hospital" ? props.name
        : undefined;

      return new Place({
        name,
        normalizedName: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        aliases: [],
        latitude: coords[1],
        longitude: coords[0],
        street: props.street,
        houseNumber: props.housenumber,
        city: props.city,
        subcity: props.state,
        region: props.state,
        country: props.country || "Ethiopia",
        postalCode: props.postcode,
        building: buildingName,
        source,
        locationType: mapOsmValueToLocationType(props.osm_value, props.osm_key),
        category: osmValueToCategory(props.osm_value, props.osm_key),
        confidence: 0.7,
        providerMetadata: {
          sourceProvider: PlaceSource.PHOTON,
          officialName: props.name,
          buildingName,
          roadName: props.street,
          city: props.city,
          subcity: props.state,
          displayName: [props.name, props.street, props.city].filter(Boolean).join(", "),
        },
      });
    });
  }

  mapReverseGeocode(raw: unknown): {
    address: import("../../../../domain/entities").PackManAddress;
    places: Place[];
  } {
    const response = raw as PhotonResponse;
    const feature = response.features?.[0];
    if (!feature) {
      return {
        address: new (require("../../../../domain/entities").PackManAddress)(
          undefined, undefined, undefined, undefined, undefined, "Ethiopia",
        ),
        places: [],
      };
    }

    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    const { PackManAddress } = require("../../../../domain/entities");
    const address = PackManAddress.fromComponents({
      street: props.street,
      building: props.housenumber,
      city: props.city,
      subcity: props.state,
      region: props.state,
      country: props.country || "Ethiopia",
      postcode: props.postcode,
    });

    const place = new Place({
      name: props.name || "Unknown",
      normalizedName: (props.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      latitude: coords[1],
      longitude: coords[0],
      street: props.street,
      houseNumber: props.housenumber,
      city: props.city,
      subcity: props.state,
      region: props.state,
      country: props.country || "Ethiopia",
      postalCode: props.postcode,
      source: PlaceSource.PHOTON,
      confidence: 0.7,
      providerMetadata: {
        sourceProvider: PlaceSource.PHOTON,
        officialName: props.name,
        roadName: props.street,
        city: props.city,
        displayName: [props.name, props.street, props.city].filter(Boolean).join(", "),
      },
    });

    return { address, places: [place] };
  }
}
