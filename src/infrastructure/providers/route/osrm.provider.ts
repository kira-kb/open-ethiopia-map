import { IRouteProvider, RouteRequest, RouteResult, Logger } from "../../../domain/interfaces";
import { Coordinates } from "../../../domain/value-objects";
import { config } from "../../config";
import { OsrmRouteMapper } from "./mappers/osrm-route.mapper";

// In single-graph deployment (ethiopia-unified.lua), local OSRM serves the unified road network under 'driving'.
// Vehicle / mode specific calibrations (bajaj, walking, cycling) are accurately calculated via EtaEnhancer.
const PROFILE_MAP: Record<string, string> = {
  driving: "driving",
  bajaj: "driving",
  cycling: "driving",
  walking: "driving",
  motorcycle: "driving",
};

export class OsrmRouteProvider implements IRouteProvider {
  readonly name = "osrm";
  private readonly mapper = new OsrmRouteMapper();

  constructor(private readonly logger?: Logger) {}

  async route(request: RouteRequest): Promise<RouteResult> {
    const points = [request.origin, ...(request.stops || []), request.destination];
    const coordsStr = points.map((c) => `${c.longitude},${c.latitude}`).join(";");
    const osrmServiceProfile = PROFILE_MAP[request.profile] || "driving";

    const candidateUrls: string[] = [config.routeProvider.osrm.baseUrl];
    if (config.routeProvider.osrm.allowPublicFallback) {
      candidateUrls.push("https://router.project-osrm.org");
    }

    let lastError: Error | null = null;

    for (const baseUrl of candidateUrls) {
      const isPublic = baseUrl.includes("project-osrm.org");
      const serviceProfile = isPublic
        ? (request.profile === "cycling" ? "bicycle" : request.profile === "walking" ? "foot" : "driving")
        : osrmServiceProfile;

      const url = new URL(
        `${baseUrl}/route/v1/${serviceProfile}/${coordsStr}`,
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
          const routes = this.mapper.map(raw, this.name, request.lang || "en");
          if (isPublic) {
            this.logger?.warn("OSRM routed via public fallback (router.project-osrm.org) because local instance failed or is offline", {
              profile: request.profile,
            });
          }
          return { routes, provider: this.name };
        }
        lastError = new Error(`OSRM (${baseUrl}) returned HTTP ${res.status}: ${res.statusText}`);
      } catch (err) {
        lastError = err as Error;
        this.logger?.warn(`OSRM attempt failed on ${baseUrl}: ${(err as Error).message}`);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new Error("OSRM routing failed");
  }
}
