import { randomUUID } from "crypto";
import { IRouteProvider, RouteRequest, RouteResult } from "../../../domain/interfaces";
import { Coordinates, Distance, Duration } from "../../../domain/value-objects";
import { PackManRoute, RouteGeometry, RouteStep, RouteWaypoint } from "../../../domain/entities";

/**
 * Speed profiles in meters per second for realistic urban transport in Ethiopia.
 * Driving in Addis Ababa / Ethiopian urban corridors averages ~30 km/h due to traffic and topography.
 */
const SPEED_METERS_PER_SECOND: Record<string, number> = {
  driving: 8.33,     // 30 km/h
  motorcycle: 8.89,  // 32 km/h
  cycling: 4.17,     // 15 km/h
  walking: 1.25,     // 4.5 km/h
};

/**
 * Urban road tortuosity/detour factor.
 * Actual road distance in Ethiopian cities is on average ~1.28x Euclidean / Haversine distance.
 */
const URBAN_DETOUR_FACTOR = 1.28;

export class EmergencyFallbackRouteProvider implements IRouteProvider {
  readonly name = "emergency-fallback";

  async route(request: RouteRequest): Promise<RouteResult> {
    const points: Coordinates[] = [
      request.origin,
      ...(request.stops || []),
      request.destination,
    ];

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

      // Interpolate 5-8 points along the segment with slight arc for realistic map display
      const legCoords = this.interpolateLeg(from, to, 6);

      // Avoid duplicating junction points
      if (allCoordinates.length > 0) {
        allCoordinates.push(...legCoords.slice(1));
      } else {
        allCoordinates.push(...legCoords);
      }

      const isFirst = i === 0;
      const isLast = i === points.length - 2;

      let instruction = `Continue towards next point for ${Math.round(legMeters)}m`;
      let type = "turn";
      let modifier = "straight";

      if (isFirst) {
        instruction = `Head towards destination (${Math.round(legMeters)}m)`;
        type = "depart";
        modifier = "";
      } else if (isLast) {
        instruction = `Proceed to final destination (${Math.round(legMeters)}m)`;
      } else {
        instruction = `Proceed to stop ${i + 1} (${Math.round(legMeters)}m)`;
      }

      const legGeometry: RouteGeometry = {
        type: "LineString",
        coordinates: legCoords,
      };

      steps.push({
        instruction,
        distance: new Distance(legMeters, "m"),
        duration: new Duration(legSeconds, "s"),
        type,
        modifier,
        geometry: legGeometry,
      });

      if (isLast) {
        steps.push({
          instruction: "You have arrived at your destination",
          distance: new Distance(0, "m"),
          duration: new Duration(0, "s"),
          type: "arrive",
          modifier: "",
          geometry: {
            type: "LineString",
            coordinates: [[to.longitude, to.latitude]],
          },
        });
      }
    }

    const totalSeconds = Math.max(10, Math.round(totalMeters / speed));
    const distanceVo = new Distance(totalMeters, "m");
    const durationVo = new Duration(totalSeconds, "s");

    const fullGeometry: RouteGeometry = {
      type: "LineString",
      coordinates: allCoordinates,
    };

    const route = new PackManRoute(
      randomUUID(),
      fullGeometry,
      distanceVo,
      durationVo,
      waypoints,
      this.name,
      steps,
    );

    return {
      routes: [route],
      provider: this.name,
    };
  }

  /**
   * Generates smoothly interpolated intermediate points between two coordinates,
   * adding a subtle lateral offset to reflect realistic road topography.
   */
  private interpolateLeg(
    from: Coordinates,
    to: Coordinates,
    numPoints: number,
  ): [number, number][] {
    const coords: [number, number][] = [];
    const dLat = to.latitude - from.latitude;
    const dLng = to.longitude - from.longitude;

    // Perpendicular vector for subtle road curvature
    const perpLat = -dLng * 0.04;
    const perpLng = dLat * 0.04;

    for (let k = 0; k <= numPoints; k++) {
      const t = k / numPoints;
      // Parabolic curve: highest at t=0.5
      const curve = Math.sin(t * Math.PI);
      const lat = from.latitude + t * dLat + curve * perpLat;
      const lng = from.longitude + t * dLng + curve * perpLng;
      coords.push([Number(lng.toFixed(6)), Number(lat.toFixed(6))]);
    }

    return coords;
  }
}
