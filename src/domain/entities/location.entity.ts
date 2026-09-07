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

export interface LocationConstructor {
  id?: string;
  name: string;
  normalizedName: string;
  latitude: number;
  longitude: number;
  locationType?: LocationType;
  category?: string;
  subcategory?: string;
  verified?: boolean;
  formattedAddress?: string;
  street?: string;
  houseNumber?: string;
  district?: string;
  subcity?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export class Location {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly locationType?: LocationType;
  readonly category?: string;
  readonly subcategory?: string;
  readonly verified: boolean;
  readonly formattedAddress?: string;
  readonly street?: string;
  readonly houseNumber?: string;
  readonly district?: string;
  readonly subcity?: string;
  readonly city?: string;
  readonly region?: string;
  readonly country: string;
  readonly postalCode?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LocationConstructor) {
    this.id = props.id || "";
    this.name = props.name;
    this.normalizedName = props.normalizedName;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.locationType = props.locationType;
    this.category = props.category;
    this.subcategory = props.subcategory;
    this.verified = props.verified || false;
    this.formattedAddress = props.formattedAddress;
    this.street = props.street;
    this.houseNumber = props.houseNumber;
    this.district = props.district;
    this.subcity = props.subcity;
    this.city = props.city;
    this.region = props.region;
    this.country = props.country || "Ethiopia";
    this.postalCode = props.postalCode;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  get address(): string {
    return this.formattedAddress || [this.street, this.subcity, this.city, this.region, this.country].filter(Boolean).join(", ");
  }
}
