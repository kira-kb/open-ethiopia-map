import { IRouteProvider, RouteRequest, RouteResult } from "../../../domain/interfaces";
import { Coordinates } from "../../../domain/value-objects";
import { config } from "../../config";
import { OsrmRouteMapper } from "./mappers/osrm-route.mapper";

const PROFILE_MAP: Record<string, string> = {
  driving: "driving",
  cycling: "bicycle",
  walking: "foot",
  motorcycle: "driving",
};

export class OsrmRouteProvider implements IRouteProvider {
  readonly name = "osrm";
  private readonly mapper = new OsrmRouteMapper();

  async route(request: RouteRequest): Promise<RouteResult> {
    const points = [request.origin, ...(request.stops || []), request.destination];
    const coordsStr = points.map((c) => `${c.longitude},${c.latitude}`).join(";");
    const profile = PROFILE_MAP[request.profile] || "driving";

    const candidateUrls = [
      config.routeProvider.osrm.baseUrl,
      "https://router.project-osrm.org",
    ].filter(Boolean);

    let lastError: Error | null = null;

    for (const baseUrl of candidateUrls) {
      const url = new URL(
        `${baseUrl}/route/v1/${profile}/${coordsStr}`,
      );
      url.searchParams.set("overview", "full");
      url.searchParams.set("geometries", "geojson");
      url.searchParams.set("alternatives", String(request.alternatives || 0));
      url.searchParams.set("steps", String(request.steps ?? true));
      url.searchParams.set("annotations", String(request.annotations || false));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.routeProvider.osrm.timeoutMs);

      try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (res.ok) {
          const raw = await res.json();
          const routes = this.mapper.map(raw, this.name);
          return { routes, provider: this.name };
        }
        lastError = new Error(`OSRM (${baseUrl}) returned ${res.status}: ${res.statusText}`);
      } catch (err) {
        lastError = err as Error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new Error("OSRM routing failed");
  }
}
