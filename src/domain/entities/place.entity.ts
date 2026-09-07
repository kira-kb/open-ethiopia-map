export enum PlaceSource {
  OPEN_STREET_MAP = "OPEN_STREET_MAP",
  PHOTON = "PHOTON",
  NOMINATIM = "NOMINATIM",
  GOOGLE_PLACES = "GOOGLE_PLACES",
  MAPBOX = "MAPBOX",
  HERE = "HERE",
  PELIAS = "PELIAS",
  GEOAPIFY = "GEOAPIFY",
  APPLE_MAPS = "APPLE_MAPS",
  MANUAL = "MANUAL",
  PACKMAN = "PACKMAN",
  IMPORTED_DATASET = "IMPORTED_DATASET",
  SCRAPER = "SCRAPER",
}

export enum LocationType {
  APARTMENT = "APARTMENT",
  CONDOMINIUM = "CONDOMINIUM",
  OFFICE = "OFFICE",
  OFFICE_BUILDING = "OFFICE_BUILDING",
  SHOPPING_MALL = "SHOPPING_MALL",
  HOTEL = "HOTEL",
  HOSPITAL = "HOSPITAL",
  SCHOOL = "SCHOOL",
  UNIVERSITY = "UNIVERSITY",
  RESTAURANT = "RESTAURANT",
  WAREHOUSE = "WAREHOUSE",
  FACTORY = "FACTORY",
  GOVERNMENT_OFFICE = "GOVERNMENT_OFFICE",
  BANK = "BANK",
  PHARMACY = "PHARMACY",
  FUEL_STATION = "FUEL_STATION",
  PARKING = "PARKING",
  HOUSE = "HOUSE",
  VILLA = "VILLA",
  ROAD = "ROAD",
  STREET = "STREET",
  INTERSECTION = "INTERSECTION",
  LANDMARK = "LANDMARK",
  BUS_STATION = "BUS_STATION",
  AIRPORT = "AIRPORT",
  SMART_LOCKER = "SMART_LOCKER",
  DORMITORY = "DORMITORY",
  SHOP = "SHOP",
  POLICE = "POLICE",
  FIRE_STATION = "FIRE_STATION",
  TAXI_STAND = "TAXI_STAND",
  PARK = "PARK",
  CONSTRUCTION_SITE = "CONSTRUCTION_SITE",
  OTHER = "OTHER",
}

export interface PlaceAddress {
  street?: string;
  houseNumber?: string;
  building?: string;
  block?: string;
  floor?: string;
  unit?: string;
  district?: string;
  subcity?: string;
  city?: string;
  region?: string;
  country: string;
  postalCode?: string;
  formatted?: string;
}

export interface ExtraFieldDef {
  key: string;
  label: string;
  type: "text" | "number";
  optional?: boolean;
  reason?: string;
}

export const LOCATION_TYPE_EXTRA_FIELDS: Record<LocationType, ExtraFieldDef[]> = {
  [LocationType.APARTMENT]: [
    { key: "apartmentName", label: "Apartment Name", type: "text", reason: "Helps your driver find the correct building entrance and deliver directly to your unit." },
    { key: "block", label: "Block", type: "text", reason: "Large complexes have multiple blocks — this ensures your driver goes to the right one." },
    { key: "floor", label: "Floor", type: "text", reason: "Saves your driver time searching; your delivery arrives faster." },
    { key: "unitNumber", label: "Unit Number", type: "text", reason: "Ensures your package reaches your door, not your neighbor's." },
  ],
  [LocationType.CONDOMINIUM]: [
    { key: "condominiumName", label: "Condominium Name", type: "text", reason: "Helps your driver identify the right complex among nearby buildings." },
    { key: "blockNumber", label: "Block", type: "text", reason: "Large complexes have multiple blocks — this ensures your driver goes to the right one." },
    { key: "buildingNumber", label: "Building Number", type: "text", reason: "Precise building number means no wrong turns for your driver." },
    { key: "floor", label: "Floor", type: "text", reason: "Saves your driver time searching; your delivery arrives faster." },
    { key: "unitNumber", label: "Unit Number", type: "text", reason: "Ensures your package reaches your door, not your neighbor's." },
  ],
  [LocationType.OFFICE]: [
    { key: "buildingName", label: "Building Name", type: "text", reason: "Helps your driver identify the right building among nearby offices." },
    { key: "floor", label: "Floor", type: "text", reason: "Saves your driver from wandering through multiple floors." },
    { key: "officeNumber", label: "Office / Suite No.", type: "text", reason: "Ensures your delivery reaches your desk, not another office." },
    { key: "receptionName", label: "Reception / Contact Name", type: "text", optional: true, reason: "If there's a reception desk, your driver can hand the package to the right person." },
  ],
  [LocationType.OFFICE_BUILDING]: [
    { key: "buildingName", label: "Building Name", type: "text", reason: "Helps your driver identify the right building among nearby offices." },
    { key: "floor", label: "Floor", type: "text", reason: "Saves your driver from wandering through multiple floors." },
    { key: "officeNumber", label: "Office / Suite No.", type: "text", reason: "Ensures your delivery reaches your desk, not another office." },
  ],
  [LocationType.SHOPPING_MALL]: [
    { key: "mallName", label: "Mall Name", type: "text", reason: "Helps your driver navigate to the right shopping center." },
    { key: "floor", label: "Floor", type: "text", reason: "Shops span multiple levels — this avoids unnecessary searching." },
    { key: "shopNumber", label: "Shop / Store No.", type: "text", reason: "Your driver goes directly to your store, not wandering the mall." },
    { key: "entrance", label: "Nearest Entrance", type: "text", optional: true, reason: "The closest entrance to your shop means faster delivery." },
  ],
  [LocationType.HOTEL]: [
    { key: "hotelName", label: "Hotel Name", type: "text", reason: "Ensures your driver heads to the right hotel, not a similar one nearby." },
    { key: "tower", label: "Tower / Wing", type: "text", optional: true, reason: "Large hotels have multiple towers — your driver goes to the right one." },
    { key: "floor", label: "Floor", type: "text", optional: true, reason: "Saves time finding your specific room level." },
  ],
  [LocationType.HOSPITAL]: [
    { key: "hospitalName", label: "Hospital Name", type: "text", reason: "Helps your driver identify the correct hospital campus." },
    { key: "buildingWing", label: "Building / Wing", type: "text", optional: true, reason: "Hospitals have multiple wings — ensures your package reaches the right department." },
    { key: "department", label: "Department / Ward", type: "text", optional: true, reason: "Directs your driver to the exact unit without wandering." },
    { key: "entrance", label: "Entrance / Gate", type: "text", optional: true, reason: "The closest entrance saves your driver time finding parking." },
  ],
  [LocationType.SCHOOL]: [
    { key: "schoolName", label: "School Name", type: "text", reason: "Helps your driver identify the correct school among nearby buildings." },
    { key: "classBlock", label: "Class Block", type: "text", optional: true, reason: "Schools are spread across blocks — this gets your delivery to the right area." },
    { key: "entrance", label: "Main Entrance", type: "text", optional: true, reason: "Most schools have restricted access; the right entrance saves time." },
  ],
  [LocationType.UNIVERSITY]: [
    { key: "universityName", label: "University Name", type: "text", reason: "Ensures your driver navigates to the correct university campus." },
    { key: "campus", label: "Campus / College", type: "text", optional: true, reason: "Large universities have multiple campuses — this avoids wrong turns." },
    { key: "department", label: "Department", type: "text", optional: true, reason: "Narrows the drop-off point to your specific building." },
    { key: "gate", label: "Gate / Entrance", type: "text", optional: true, reason: "Security gates vary — choosing the right one avoids delays." },
  ],
  [LocationType.DORMITORY]: [
    { key: "dormitoryName", label: "Dormitory Name", type: "text", reason: "Helps your driver find the correct dormitory building on campus." },
    { key: "block", label: "Block", type: "text", optional: true, reason: "Large dorms have multiple blocks — your driver goes to the right one." },
    { key: "floor", label: "Floor", type: "text", optional: true, reason: "Saves your driver time navigating inside the building." },
    { key: "unitNumber", label: "Room Number", type: "text", optional: true, reason: "Ensures your package reaches your room, not someone else's." },
  ],
  [LocationType.RESTAURANT]: [
    { key: "restaurantName", label: "Restaurant Name", type: "text", reason: "Helps your driver identify the correct restaurant in a busy area." },
    { key: "floor", label: "Floor", type: "text", optional: true, reason: "Multi-level buildings — directs your driver to the right level." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A nearby landmark helps your driver spot the restaurant faster." },
  ],
  [LocationType.SHOP]: [
    { key: "shopName", label: "Shop Name", type: "text", reason: "Identifies your shop in a row of storefronts." },
    { key: "shopNumber", label: "Shop Number", type: "text", optional: true, reason: "Narrows it down so your driver doesn't search store by store." },
    { key: "mallOrComplex", label: "Mall / Complex Name", type: "text", optional: true, reason: "Shops inside complexes need the complex name for your driver to find the entrance." },
  ],
  [LocationType.WAREHOUSE]: [
    { key: "warehouseName", label: "Warehouse Name", type: "text", reason: "Helps your driver identify the correct warehouse in an industrial area." },
    { key: "warehouseNumber", label: "Warehouse No.", type: "text", optional: true, reason: "Numbered warehouses are easier to spot — no guessing." },
    { key: "loadingGate", label: "Loading Gate / Dock", type: "text", optional: true, reason: "Large warehouses have multiple gates — directs your driver to the right one." },
    { key: "compoundName", label: "Industrial Compound", type: "text", optional: true, reason: "Compounds with multiple warehouses need the compound name to find the entrance." },
  ],
  [LocationType.FACTORY]: [
    { key: "factoryName", label: "Factory Name", type: "text", reason: "Helps your driver identify the correct facility." },
    { key: "gate", label: "Gate Number", type: "text", optional: true, reason: "Factories have multiple gates — this saves your driver circling around." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A recognizable landmark helps your driver locate your factory faster." },
  ],
  [LocationType.GOVERNMENT_OFFICE]: [
    { key: "officeName", label: "Office / Department Name", type: "text", reason: "Directs your driver to the correct government building." },
    { key: "floor", label: "Floor", type: "text", optional: true, reason: "Large government buildings have many floors — your driver goes straight to yours." },
    { key: "officeNumber", label: "Room / Office No.", type: "text", optional: true, reason: "Ensures your delivery reaches the right desk." },
  ],
  [LocationType.BANK]: [
    { key: "bankName", label: "Bank Name", type: "text", reason: "Helps your driver identify the correct bank branch." },
    { key: "branchName", label: "Branch Name", type: "text", optional: true, reason: "Banks have multiple branches — this avoids confusion." },
  ],
  [LocationType.PHARMACY]: [
    { key: "pharmacyName", label: "Pharmacy Name", type: "text", reason: "Identifies the correct pharmacy among nearby shops." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A nearby landmark helps your driver spot the pharmacy faster." },
  ],
  [LocationType.FUEL_STATION]: [
    { key: "stationName", label: "Station Name", type: "text", reason: "Identifies the correct fuel station along the road." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "Helps your driver locate the station quickly." },
  ],
  [LocationType.PARKING]: [
    { key: "parkingName", label: "Parking Name / Lot", type: "text", reason: "Identifies the correct parking area for your driver." },
    { key: "level", label: "Level / Floor", type: "text", optional: true, reason: "Multi-level parking — your driver knows exactly where to go." },
    { key: "spotNumber", label: "Spot Number", type: "text", optional: true, reason: "Narrows it down for precise delivery to your vehicle." },
  ],
  [LocationType.HOUSE]: [
    { key: "houseNumber", label: "House Number", type: "text", reason: "The most direct way for your driver to find your door." },
    { key: "compoundName", label: "Compound Name", type: "text", optional: true, reason: "Gated compounds need the name so your driver can access the gate." },
    { key: "gateColor", label: "Gate Color", type: "text", optional: true, reason: "A distinct gate color helps your driver spot your house instantly." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A recognizable landmark nearby removes any guesswork." },
  ],
  [LocationType.VILLA]: [
    { key: "villaName", label: "Villa Name", type: "text", reason: "Unique villa names make it easy for your driver to identify your home." },
    { key: "compoundName", label: "Compound Name", type: "text", optional: true, reason: "Gated compounds need the name so your driver can access the gate." },
    { key: "gateColor", label: "Gate Color", type: "text", optional: true, reason: "A distinct gate color helps your driver spot your villa instantly." },
  ],
  [LocationType.ROAD]: [
    { key: "nearestBuilding", label: "Nearest Building", type: "text", reason: "Gives your driver a reference point to find you on the road." },
    { key: "landmark", label: "Landmark", type: "text", optional: true, reason: "A known landmark removes ambiguity on long roads." },
  ],
  [LocationType.STREET]: [
    { key: "nearestBuilding", label: "Nearest Building", type: "text", reason: "Gives your driver a reference point to find you on the street." },
    { key: "landmark", label: "Landmark", type: "text", optional: true, reason: "A known landmark removes ambiguity on long streets." },
  ],
  [LocationType.INTERSECTION]: [
    { key: "roadA", label: "Road A", type: "text", reason: "Identifies the first crossing road so your driver knows which intersection." },
    { key: "roadB", label: "Road B", type: "text", reason: "Identifies the second crossing road to pinpoint the exact intersection." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A nearby landmark confirms the right intersection." },
  ],
  [LocationType.LANDMARK]: [
    { key: "landmarkName", label: "Landmark Name", type: "text", reason: "A well-known landmark makes your location instantly recognizable." },
    { key: "notes", label: "Meeting Point Details", type: "text", optional: true, reason: "Specific meeting spots near the landmark save time coordinating." },
  ],
  [LocationType.BUS_STATION]: [
    { key: "stationName", label: "Station Name", type: "text", reason: "Identifies the correct bus station or terminal." },
    { key: "gate", label: "Gate / Platform", type: "text", optional: true, reason: "Bus stations are large — your driver knows where to meet you." },
  ],
  [LocationType.TAXI_STAND]: [
    { key: "standName", label: "Stand Name", type: "text", reason: "Identifies the correct taxi stand." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A nearby landmark helps your driver navigate to the stand." },
  ],
  [LocationType.AIRPORT]: [
    { key: "airportName", label: "Airport Name", type: "text", reason: "Identifies the correct airport for your driver." },
    { key: "terminal", label: "Terminal", type: "text", reason: "Large airports have multiple terminals — your driver goes to the right one." },
    { key: "gate", label: "Gate / Arrival Door", type: "text", optional: true, reason: "Specifies exactly where to meet for pickup or delivery." },
  ],
  [LocationType.PARK]: [
    { key: "parkName", label: "Park Name", type: "text", reason: "Identifies the correct park among green spaces nearby." },
    { key: "entrance", label: "Entrance / Gate", type: "text", optional: true, reason: "Parks have multiple entrances — your driver knows where to go." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A landmark near the park helps your driver locate the entrance." },
  ],
  [LocationType.POLICE]: [
    { key: "stationName", label: "Station Name", type: "text", reason: "Identifies the correct police station." },
    { key: "department", label: "Department", type: "text", optional: true, reason: "Large stations have multiple departments — directs your driver to the right one." },
  ],
  [LocationType.FIRE_STATION]: [
    { key: "stationName", label: "Station Name", type: "text", reason: "Identifies the correct fire station." },
  ],
  [LocationType.CONSTRUCTION_SITE]: [
    { key: "projectName", label: "Project / Site Name", type: "text", reason: "Identifies the correct construction site." },
    { key: "gate", label: "Gate / Entrance", type: "text", optional: true, reason: "Construction sites have controlled access — the right gate saves time." },
    { key: "landmark", label: "Nearby Landmark", type: "text", optional: true, reason: "A nearby landmark helps your driver find the site entrance." },
  ],
  [LocationType.SMART_LOCKER]: [
    { key: "lockerName", label: "Locker Name", type: "text", reason: "Identifies the correct smart locker location." },
    { key: "lockerCode", label: "Locker Code", type: "text", reason: "Required to assign your package to the right locker." },
  ],
  [LocationType.OTHER]: [],
};

export interface PlaceConstructor {
  id?: string;
  officialName?: string;
  displayName?: string;
  shortName?: string;
  name: string;
  normalizedName: string;
  aliases?: string[];
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  street?: string;
  houseNumber?: string;
  building?: string;
  block?: string;
  floor?: string;
  unit?: string;
  district?: string;
  subcity?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  locationType?: LocationType;
  category?: string;
  subcategory?: string;
  source: PlaceSource;
  providerPlaceId?: string;
  providerMetadata?: Record<string, unknown>;
  popularity?: number;
  confidence?: number;
  searchCount?: number;
  selectionCount?: number;
  verified?: boolean;
  recommendationConfidence?: number;
  recommendationCount?: number;
  confirmationCount?: number;
  editCount?: number;
  lastConfirmedAt?: Date;
  lastEditedAt?: Date;
  sourceProvider?: string;
  metadata?: Record<string, unknown>;
}

export class Place {
  readonly id: string;
  readonly officialName?: string;
  readonly displayName?: string;
  readonly shortName?: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly aliases: string[];
  readonly formattedAddress?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly street?: string;
  readonly houseNumber?: string;
  readonly building?: string;
  readonly block?: string;
  readonly floor?: string;
  readonly unit?: string;
  readonly district?: string;
  readonly subcity?: string;
  readonly city?: string;
  readonly region?: string;
  readonly country: string;
  readonly postalCode?: string;
  readonly locationType?: LocationType;
  readonly category?: string;
  readonly subcategory?: string;
  readonly source: PlaceSource;
  readonly providerPlaceId?: string;
  readonly providerMetadata?: Record<string, unknown>;
  readonly popularity: number;
  readonly confidence: number;
  readonly searchCount: number;
  readonly selectionCount: number;
  readonly verified: boolean;
  readonly recommendationConfidence: number;
  readonly recommendationCount: number;
  readonly confirmationCount: number;
  readonly editCount: number;
  readonly lastConfirmedAt?: Date;
  readonly lastEditedAt?: Date;
  readonly sourceProvider?: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PlaceConstructor) {
    this.id = props.id || "";
    this.officialName = props.officialName;
    this.displayName = props.displayName;
    this.shortName = props.shortName;
    this.name = props.name;
    this.normalizedName = props.normalizedName;
    this.aliases = props.aliases || [];
    this.formattedAddress = props.formattedAddress;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.street = props.street;
    this.houseNumber = props.houseNumber;
    this.building = props.building;
    this.block = props.block;
    this.floor = props.floor;
    this.unit = props.unit;
    this.district = props.district;
    this.subcity = props.subcity;
    this.city = props.city;
    this.region = props.region;
    this.country = props.country || "Ethiopia";
    this.postalCode = props.postalCode;
    this.locationType = props.locationType;
    this.category = props.category;
    this.subcategory = props.subcategory;
    this.source = props.source;
    this.providerPlaceId = props.providerPlaceId;
    this.providerMetadata = props.providerMetadata;
    this.popularity = props.popularity || 0;
    this.confidence = props.confidence || 0;
    this.searchCount = props.searchCount || 0;
    this.selectionCount = props.selectionCount || 0;
    this.verified = props.verified || false;
    this.recommendationConfidence = props.recommendationConfidence || 0;
    this.recommendationCount = props.recommendationCount || 0;
    this.confirmationCount = props.confirmationCount || 0;
    this.editCount = props.editCount || 0;
    this.lastConfirmedAt = props.lastConfirmedAt;
    this.lastEditedAt = props.lastEditedAt;
    this.sourceProvider = props.sourceProvider;
    this.metadata = props.metadata || {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  withId(id: string): Place {
    return new Place({ ...this.toPlain(), id });
  }

  incrementSearchCount(): Place {
    return new Place({ ...this.toPlain(), searchCount: this.searchCount + 1 });
  }

  incrementSelectionCount(): Place {
    return new Place({ ...this.toPlain(), selectionCount: this.selectionCount + 1 });
  }

  recordConfirmation(acceptedName: string): Place {
    const nameChanged = acceptedName !== this.recommendedName();
    return new Place({
      ...this.toPlain(),
      confirmationCount: this.confirmationCount + (nameChanged ? 0 : 1),
      editCount: this.editCount + (nameChanged ? 1 : 0),
      lastConfirmedAt: new Date(),
      lastEditedAt: nameChanged ? new Date() : this.lastEditedAt,
      name: this.name,
    });
  }

  recommendedName(): string {
    return this.displayName || this.officialName || this.name;
  }

  get address(): PlaceAddress {
    return {
      street: this.street,
      houseNumber: this.houseNumber,
      building: this.building,
      block: this.block,
      floor: this.floor,
      unit: this.unit,
      district: this.district,
      subcity: this.subcity,
      city: this.city,
      region: this.region,
      country: this.country,
      postalCode: this.postalCode,
      formatted: this.formattedAddress || [this.building, this.street, this.city, this.region, this.country].filter(Boolean).join(", "),
    };
  }

  toPlain() {
    return {
      id: this.id,
      officialName: this.officialName,
      displayName: this.displayName,
      shortName: this.shortName,
      name: this.name,
      normalizedName: this.normalizedName,
      aliases: this.aliases,
      formattedAddress: this.formattedAddress,
      latitude: this.latitude,
      longitude: this.longitude,
      street: this.street,
      houseNumber: this.houseNumber,
      building: this.building,
      block: this.block,
      floor: this.floor,
      unit: this.unit,
      district: this.district,
      subcity: this.subcity,
      city: this.city,
      region: this.region,
      country: this.country,
      postalCode: this.postalCode,
      locationType: this.locationType,
      category: this.category,
      subcategory: this.subcategory,
      source: this.source,
      providerPlaceId: this.providerPlaceId,
      providerMetadata: this.providerMetadata,
      popularity: this.popularity,
      confidence: this.confidence,
      searchCount: this.searchCount,
      selectionCount: this.selectionCount,
      verified: this.verified,
      recommendationConfidence: this.recommendationConfidence,
      recommendationCount: this.recommendationCount,
      confirmationCount: this.confirmationCount,
      editCount: this.editCount,
      lastConfirmedAt: this.lastConfirmedAt,
      lastEditedAt: this.lastEditedAt,
      sourceProvider: this.sourceProvider,
      metadata: this.metadata,
    };
  }
}
