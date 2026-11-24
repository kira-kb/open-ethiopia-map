import { randomUUID } from "crypto";
import { IRouteProvider, RouteRequest, RouteResult } from "../../../domain/interfaces";
import { Coordinates, Distance, Duration } from "../../../domain/value-objects";
import { PackManRoute, RouteGeometry, RouteStep, RouteWaypoint } from "../../../domain/entities";

const SPEED_METERS_PER_SECOND: Record<string, number> = {
  driving: 8.33,     // 30 km/h
  bajaj: 5.56,       // 20 km/h
  motorcycle: 8.89,  // 32 km/h
  cycling: 4.17,     // 15 km/h
  walking: 1.25,     // 4.5 km/h
};

const URBAN_DETOUR_FACTOR = 1.32;

// Key urban transit spine junctions for high-fidelity fallback routing
const URBAN_JUNCTIONS: Array<{ name: string; lat: number; lng: number }> = [
  // Addis Ababa Spines
  { name: "Meskel Square Hub", lat: 9.0108, lng: 38.7615 },
  { name: "Gotera Interchange", lat: 8.9880, lng: 38.7550 },
  { name: "Mexico Roundabout", lat: 9.0120, lng: 38.7420 },
  { name: "Megenagna Hub", lat: 9.0210, lng: 38.8020 },
  { name: "Bole Medhanialem", lat: 8.9950, lng: 38.7850 },
  { name: "Tor Hailoch", lat: 9.0150, lng: 38.7200 },
  // Gondar Spines
  { name: "Piassa Roundabout", lat: 12.6078, lng: 37.4697 },
  { name: "Azezo Bridge Hub", lat: 12.5350, lng: 37.4380 },
  { name: "Maraki Campus Junction", lat: 12.6045, lng: 37.4892 },
  { name: "Arada Posta Bet", lat: 12.6105, lng: 37.4650 },
];

export class EmergencyFallbackRouteProvider implements IRouteProvider {
  readonly name = "emergency-fallback";

  async route(request: RouteRequest): Promise<RouteResult> {
    const rawPoints: Coordinates[] = [
      request.origin,
      ...(request.stops || []),
      request.destination,
    ];

    // Arterial spine expansion: if a leg is > 2.5km, route through intermediate urban junction
    const points: Coordinates[] = [];
    for (let i = 0; i < rawPoints.length - 1; i++) {
      const p1 = rawPoints[i];
      const p2 = rawPoints[i + 1];
      points.push(p1);

      const legDist = p1.distanceTo(p2);
      if (legDist > 2500) {
        const intermediate = this.findBestArterialJunction(p1, p2);
        if (intermediate) {
          points.push(intermediate);
        }
      }
    }
    points.push(rawPoints[rawPoints.length - 1]);

    const speed = SPEED_METERS_PER_SECOND[request.profile] || SPEED_METERS_PER_SECOND.driving;

    let totalMeters = 0;
    const allCoordinates: [number, number][] = [];
    const steps: RouteStep[] = [];
    const waypoints: RouteWaypoint[] = [];

    for (let i = 0; i < points.length; i++) {
      waypoints.push({
        index: i,
        coordinates: points[i],
      });
    }

    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];

      const directMeters = from.distanceTo(to);
      const legMeters = Math.max(10, Math.round(directMeters * URBAN_DETOUR_FACTOR));
      const legSeconds = Math.max(5, Math.round(legMeters / speed));
      totalMeters += legMeters;

      const legCoords = this.interpolateLeg(from, to, 6);

      if (allCoordinates.length > 0) {
        allCoordinates.push(...legCoords.slice(1));
      } else {
        allCoordinates.push(...legCoords);
      }

      const instructionText =
        request.lang === "am"
          ? `ወደ ${to.latitude.toFixed(4)}, ${to.longitude.toFixed(4)} ቀጥታ ይቀጥሉ (${Math.round(legMeters)} ሜ)`
          : `Follow arterial corridor towards ${to.latitude.toFixed(4)}, ${to.longitude.toFixed(4)} (${Math.round(legMeters)}m)`;

      steps.push({
        instruction: instructionText,
        distance: new Distance(legMeters, "m"),
        duration: new Duration(legSeconds, "s"),
        type: "turn",
        modifier: "straight",
        geometry: {
          type: "LineString",
          coordinates: legCoords,
        },
      });
    }

    const totalSeconds = Math.max(10, Math.round(totalMeters / speed));
    const routeId = `route_emergency_${randomUUID().slice(0, 8)}`;

    const route = new PackManRoute(
      routeId,
      {
        type: "LineString",
        coordinates: allCoordinates,
      },
      new Distance(totalMeters, "m"),
      new Duration(totalSeconds, "s"),
      waypoints,
      this.name,
      steps,
    );

    return {
      routes: [route],
      provider: this.name,
    };
  }

  private findBestArterialJunction(p1: Coordinates, p2: Coordinates): Coordinates | null {
    const midLat = (p1.latitude + p2.latitude) / 2;
    const midLng = (p1.longitude + p2.longitude) / 2;
    const directDist = p1.distanceTo(p2);

    let bestJunction: Coordinates | null = null;
    let minDetour = directDist * 1.5;

    for (const j of URBAN_JUNCTIONS) {
      const jCoord = new Coordinates(j.lat, j.lng);
      const detourDist = p1.distanceTo(jCoord) + jCoord.distanceTo(p2);

      if (detourDist < minDetour) {
        const distFromMid = jCoord.distanceTo(new Coordinates(midLat, midLng));
        if (distFromMid < directDist * 0.45) {
          minDetour = detourDist;
          bestJunction = jCoord;
        }
      }
    }

    return bestJunction;
  }

  private interpolateLeg(from: Coordinates, to: Coordinates, steps: number): [number, number][] {
    const coords: [number, number][] = [];
    const dLat = (to.latitude - from.latitude) / steps;
    const dLng = (to.longitude - from.longitude) / steps;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const arc = Math.sin(t * Math.PI) * 0.0003;
      coords.push([
        from.longitude + dLng * s + arc,
        from.latitude + dLat * s,
      ]);
    }

    return coords;
  }
}
