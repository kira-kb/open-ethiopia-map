import { PackManRoute, RouteGeometry } from "../../../../domain/entities";
import { Coordinates, Distance, Duration } from "../../../../domain/value-objects";
import { ManeuverLocalizer } from "../../../../domain/services/routing/maneuver-localizer";

interface OsrmResponse {
  code: string;
  routes?: Array<{
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    legs: Array<{
      steps: Array<{
        driving_side: string;
        geometry: { type: string; coordinates: [number, number][] };
        mode: string;
        duration: number;
        maneuver: {
          bearing_after: number;
          bearing_before: number;
          location: [number, number];
          modifier: string;
          type: string;
        };
        weight: number;
        distance: number;
        name: string;
      }>;
      summary: string;
      weight: number;
      duration: number;
      distance: number;
    }>;
    weight_name: string;
    weight: number;
    duration: number;
    distance: number;
  }>;
  waypoints: Array<{
    hint: string;
    location: [number, number];
    name: string;
    distance: number;
  }>;
}

export class OsrmRouteMapper {
  map(raw: unknown, providerName: string, lang: "en" | "am" = "en"): PackManRoute[] {
    const response = raw as OsrmResponse;
    if (!response.routes?.length) return [];

    return response.routes.map((route, idx) => {
      const coords = route.geometry.coordinates;

      return new PackManRoute(
        `route_${providerName}_${idx}`,
        {
          type: "LineString",
          coordinates: coords,
        },
        new Distance(route.distance, "m"),
        new Duration(route.duration, "s"),
        (response.waypoints || []).map((wp, i) => ({
          index: i,
          coordinates: new Coordinates(wp.location[1], wp.location[0]),
        })),
        providerName,
        (route.legs?.[0]?.steps || []).map((step) => ({
          instruction: ManeuverLocalizer.format(
            {
              type: step.maneuver.type,
              modifier: step.maneuver.modifier,
              name: step.name,
            },
            lang
          ),
          distance: new Distance(step.distance, "m"),
          duration: new Duration(step.duration, "s"),
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          geometry: step.geometry as RouteGeometry,
        })),
      );
    });
  }
}
