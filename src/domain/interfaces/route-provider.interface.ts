import { Coordinates } from "../value-objects";
import { PackManRoute } from "../entities";

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  stops?: Coordinates[];
  profile: string;
  alternatives?: number;
  steps?: boolean;
  annotations?: boolean;
}

export interface RouteResult {
  routes: PackManRoute[];
  provider: string;
}

export interface IRouteProvider {
  readonly name: string;
  route(request: RouteRequest): Promise<RouteResult>;
}
