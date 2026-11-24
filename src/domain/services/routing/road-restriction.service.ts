import { Coordinates } from "../../value-objects";

export interface RestrictedZone {
  id: string;
  name: string;
  city: "addis_ababa" | "gondar" | "all";
  reason: "CONSTRUCTION" | "CORRIDOR_PROJECT" | "MEDIAN_BARRIER" | "PEDESTRIAN_ONLY" | "EVENT";
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  activeUntil?: Date;
  severity: "BLOCKED" | "HEAVY_DELAY";
}

export class RoadRestrictionService {
  private restrictions: Map<string, RestrictedZone> = new Map();

  constructor() {
    this.seedDefaultRestrictions();
  }

  private seedDefaultRestrictions(): void {
    // ── Active Addis Ababa Corridor Project Restrictions ──────────────────
    this.addRestriction({
      id: "addis_corridor_piassa_4kilo",
      name: "Piassa to 4 Kilo Corridor Reconstruction",
      city: "addis_ababa",
      reason: "CORRIDOR_PROJECT",
      bbox: { minLat: 9.030, maxLat: 9.038, minLng: 38.752, maxLng: 38.765 },
      severity: "BLOCKED",
    });

    this.addRestriction({
      id: "addis_corridor_mexico_sarbet",
      name: "Mexico to Sarbet Median Barrier / Road Works",
      city: "addis_ababa",
      reason: "MEDIAN_BARRIER",
      bbox: { minLat: 9.000, maxLat: 9.012, minLng: 38.740, maxLng: 38.750 },
      severity: "HEAVY_DELAY",
    });

    // ── Gondar Historical Castle Pedestrianization ─────────────────────────
    this.addRestriction({
      id: "gondar_fasil_ghebbi_interior",
      name: "Fasil Ghebbi Interior Compound (Pedestrian Only)",
      city: "gondar",
      reason: "PEDESTRIAN_ONLY",
      bbox: { minLat: 12.606, maxLat: 12.609, minLng: 37.468, maxLng: 37.472 },
      severity: "BLOCKED",
    });
  }

  addRestriction(zone: RestrictedZone): void {
    this.restrictions.set(zone.id, zone);
  }

  removeRestriction(id: string): boolean {
    return this.restrictions.delete(id);
  }

  listRestrictions(): RestrictedZone[] {
    const now = new Date();
    return Array.from(this.restrictions.values()).filter(
      (z) => !z.activeUntil || z.activeUntil > now,
    );
  }

  checkRouteRestrictions(coordinates: [number, number][]): {
    hasRestrictions: boolean;
    violatingZones: RestrictedZone[];
    isBlocked: boolean;
  } {
    const activeZones = this.listRestrictions();
    const violatingZones: RestrictedZone[] = [];
    let isBlocked = false;

    for (const zone of activeZones) {
      const isIntersecting = coordinates.some(
        ([lng, lat]) =>
          lat >= zone.bbox.minLat &&
          lat <= zone.bbox.maxLat &&
          lng >= zone.bbox.minLng &&
          lng <= zone.bbox.maxLng,
      );

      if (isIntersecting) {
        violatingZones.push(zone);
        if (zone.severity === "BLOCKED") {
          isBlocked = true;
        }
      }
    }

    return {
      hasRestrictions: violatingZones.length > 0,
      violatingZones,
      isBlocked,
    };
  }
}
