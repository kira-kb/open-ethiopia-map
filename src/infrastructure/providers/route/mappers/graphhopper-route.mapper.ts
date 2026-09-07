import { PackManRoute, RouteGeometry } from "../../../../domain/entities";
import { Coordinates, Distance, Duration } from "../../../../domain/value-objects";

interface GraphHopperInstruction {
  text: string;
  distance: number;
  time: number;
  sign?: number;
}

interface GraphHopperPath {
  distance: number;
  time: number;
  points: {
    type: string;
    coordinates: [number, number][];
  };
  instructions?: GraphHopperInstruction[];
}

interface GraphHopperResponse {
  paths?: GraphHopperPath[];
  message?: string;
}

export class GraphHopperRouteMapper {
  map(raw: unknown, providerName: string): PackManRoute[] {
    const response = raw as GraphHopperResponse;
    if (!response.paths?.length) return [];

    return response.paths.map((path, idx) => {
      const coords = path.points.coordinates;

      return new PackManRoute(
        `route_${providerName}_${idx}`,
        {
          type: "LineString",
          coordinates: coords,
        },
        new Distance(path.distance, "m"),
        new Duration(path.time / 1000, "s"),
        [
          { index: 0, coordinates: new Coordinates(coords[0][1], coords[0][0]) },
          {
            index: 1,
            coordinates: new Coordinates(
              coords[coords.length - 1][1],
              coords[coords.length - 1][0],
            ),
          },
        ],
        providerName,
        (path.instructions || []).map((step) => ({
          instruction: step.text,
          distance: new Distance(step.distance, "m"),
          duration: new Duration(step.time / 1000, "s"),
          type: "turn",
          modifier: String(step.sign || 0),
          geometry: {
            type: "LineString",
            coordinates: coords,
          } as RouteGeometry,
        })),
      );
    });
  }
}
