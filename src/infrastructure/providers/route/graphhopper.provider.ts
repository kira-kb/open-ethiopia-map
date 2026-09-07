import { IRouteProvider, RouteRequest, RouteResult } from "../../../domain/interfaces";
import { config } from "../../config";
import { GraphHopperRouteMapper } from "./mappers/graphhopper-route.mapper";

const PROFILE_MAP: Record<string, string> = {
  driving: "car",
  cycling: "bike",
  walking: "foot",
  motorcycle: "car",
};

export class GraphHopperRouteProvider implements IRouteProvider {
  readonly name = "graphhopper";
  private readonly mapper = new GraphHopperRouteMapper();

  async route(request: RouteRequest): Promise<RouteResult> {
    const points = [request.origin, ...(request.stops || []), request.destination];
    const pointsParam = points
      .map((c) => `point=${c.latitude.toFixed(6)},${c.longitude.toFixed(6)}`)
      .join("&");
    const profile = PROFILE_MAP[request.profile] || "car";
    const apiKey = config.routeProvider.graphhopper.apiKey;

    const url = `${config.routeProvider.graphhopper.baseUrl}/route?${pointsParam}&profile=${profile}&key=${apiKey}&points_encoded=false&instructions=true`;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.routeProvider.graphhopper.timeoutMs,
    );

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GraphHopper returned ${res.status}: ${text}`);
      }
      const raw = await res.json();
      const routes = this.mapper.map(raw, this.name);
      return { routes, provider: this.name };
    } finally {
      clearTimeout(timeout);
    }
  }
}
