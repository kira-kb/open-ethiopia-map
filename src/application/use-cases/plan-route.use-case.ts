import { IRouteProvider } from "../../domain/interfaces";
import { ICache } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { IMetricsRegistry } from "../../domain/interfaces";
import { IEventBus } from "../../domain/interfaces";
import { Coordinates, Distance, Duration, parseProfile } from "../../domain/value-objects";
import { PackManRoute } from "../../domain/entities";
import { RouteCalculated } from "../../domain/events";
import { crypto } from "../../infrastructure/utils/crypto";

export interface PlanRouteCommand {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  stops?: { lat: number; lng: number }[];
  profile: string;
  alternatives?: number;
  steps?: boolean;
}

export class PlanRouteUseCase {
  constructor(
    private readonly routeProvider: IRouteProvider,
    private readonly cache: ICache,
    private readonly logger: Logger,
    private readonly metrics: IMetricsRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: PlanRouteCommand): Promise<{
    routes: PackManRoute[];
    cached: boolean;
  }> {
    const origin = new Coordinates(command.origin.lat, command.origin.lng);
    const destination = new Coordinates(command.destination.lat, command.destination.lng);
    const stops = (command.stops || []).map((s) => new Coordinates(s.lat, s.lng));
    const profile = parseProfile(command.profile);

    const cacheKey = this.buildCacheKey(origin, destination, stops, profile, command.alternatives);
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.logger.info("Route cache hit", { cacheKey });
      await this.eventBus.publish(new RouteCalculated(
        origin.toKey(), destination.toKey(), profile, "cache", 0, true,
      ));
      const routes = cached.map((r: any) => {
        const distanceVal = typeof r.distance?.value === "number" ? r.distance.value : (typeof r.distance === "number" ? r.distance : 0);
        const distanceUnit = r.distance?.unit || "m";
        const durationVal = typeof r.duration?.value === "number" ? r.duration.value : (typeof r.duration === "number" ? r.duration : 0);
        const durationUnit = r.duration?.unit || "s";

        const distance = new Distance(distanceVal, distanceUnit);
        const duration = new Duration(durationVal, durationUnit);

        const waypoints = (r.waypoints || []).map((wp: any) => ({
          index: wp.index ?? 0,
          coordinates: new Coordinates(
            wp.coordinates?.latitude ?? wp.lat ?? 0,
            wp.coordinates?.longitude ?? wp.lng ?? 0,
          ),
        }));

        const steps = (r.steps || []).map((s: any) => {
          const sDistVal = typeof s.distance?.value === "number" ? s.distance.value : (typeof s.distance === "number" ? s.distance : 0);
          const sDurVal = typeof s.duration?.value === "number" ? s.duration.value : (typeof s.duration === "number" ? s.duration : 0);
          return {
            instruction: s.instruction || "",
            distance: new Distance(sDistVal, s.distance?.unit || "m"),
            duration: new Duration(sDurVal, s.duration?.unit || "s"),
            type: s.type || "",
            modifier: s.modifier || "",
            geometry: s.geometry || { type: "LineString", coordinates: [] },
          };
        });

        return new PackManRoute(r.id, r.geometry, distance, duration, waypoints, r.provider || "osrm", steps);
      });
      return { routes, cached: true };
    }

    const start = Date.now();
    const result = await this.routeProvider.route({
      origin,
      destination,
      stops,
      profile,
      alternatives: command.alternatives || 0,
      steps: command.steps ?? true,
    });
    const durationMs = Date.now() - start;

    await this.cache.set(cacheKey, result.routes, 3600);
    await this.eventBus.publish(new RouteCalculated(
      origin.toKey(), destination.toKey(), profile, result.provider, durationMs, false,
    ));

    return { routes: result.routes, cached: false };
  }

  private buildCacheKey(
    origin: Coordinates,
    destination: Coordinates,
    stops: Coordinates[],
    profile: string,
    alternatives?: number,
  ): string {
    const parts = [
      "route",
      origin.toKey(),
      destination.toKey(),
      ...stops.map((s) => s.toKey()),
      profile,
      String(alternatives || 0),
    ];
    return crypto.md5(parts.join("|"));
  }
}
