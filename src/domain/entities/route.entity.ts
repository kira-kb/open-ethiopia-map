import { Coordinates, Distance, Duration } from "../value-objects";

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface RouteStep {
  instruction: string;
  distance: Distance;
  duration: Duration;
  type: string;
  modifier: string;
  geometry: RouteGeometry;
}

export interface RouteWaypoint {
  index: number;
  coordinates: Coordinates;
}

export class PackManRoute {
  constructor(
    readonly id: string,
    readonly geometry: RouteGeometry,
    readonly distance: Distance,
    readonly duration: Duration,
    readonly waypoints: RouteWaypoint[],
    readonly provider: string,
    readonly steps: RouteStep[] = [],
  ) {}

  get summary() {
    return {
      distance: { value: this.distance.inMeters(), unit: "m" as const },
      duration: { value: this.duration.inSeconds(), unit: "s" as const },
      distanceText: this.distance.toText(),
      durationText: this.duration.toText(),
    };
  }
}
