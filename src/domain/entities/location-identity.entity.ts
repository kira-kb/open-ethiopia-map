import { createHash } from "crypto";

export interface LocationIdentityInput {
  title: string;
  latitude: number;
  longitude: number;
  city?: string;
  street?: string;
  building?: string;
  postcode?: string;
}

export class LocationIdentity {
  readonly hash: string;
  readonly title: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly city?: string;
  readonly street?: string;

  constructor(input: LocationIdentityInput) {
    this.title = input.title;
    this.latitude = input.latitude;
    this.longitude = input.longitude;
    this.city = input.city;
    this.street = input.street;

    this.hash = LocationIdentity.generateHash(input);
  }

  static generateHash(input: LocationIdentityInput): string {
    const normalizedName = input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

    const roundedLat = Math.round(input.latitude * 100) / 100;
    const roundedLng = Math.round(input.longitude * 100) / 100;

    const parts = [
      normalizedName.slice(0, 20),
      `${roundedLat}:${roundedLng}`,
      input.city?.toLowerCase().trim() || "",
      input.street?.toLowerCase().trim() || "",
      input.building?.toLowerCase().trim() || "",
      input.postcode?.trim() || "",
    ].filter(Boolean);

    return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
  }

  static fromSearchResult(r: { title: string; latitude: number; longitude: number; city?: string; address?: string }): LocationIdentity {
    return new LocationIdentity({
      title: r.title,
      latitude: r.latitude,
      longitude: r.longitude,
      city: r.city,
      street: r.address,
    });
  }
}
