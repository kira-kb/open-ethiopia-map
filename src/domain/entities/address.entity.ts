export class PackManAddress {
  constructor(
    readonly street?: string,
    readonly building?: string,
    readonly city?: string,
    readonly subcity?: string,
    readonly region?: string,
    readonly country: string = "Ethiopia",
    readonly postcode?: string,
    readonly formatted?: string,
  ) {}

  static fromComponents(components: {
    street?: string;
    building?: string;
    city?: string;
    subcity?: string;
    region?: string;
    country?: string;
    postcode?: string;
  }): PackManAddress {
    return new PackManAddress(
      components.street,
      components.building,
      components.city,
      components.subcity,
      components.region,
      components.country || "Ethiopia",
      components.postcode,
      PackManAddress.format(components),
    );
  }

  private static format(c: Record<string, string | undefined>): string {
    return [c.building, c.street, c.city, c.region, c.country]
      .filter(Boolean)
      .join(", ");
  }
}
