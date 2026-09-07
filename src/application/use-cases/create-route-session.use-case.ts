import {
  IRouteSessionRepository,
} from "../../domain/interfaces/route-session-repository.interface";
import { IEventBus, ICache, Logger, IMetricsRegistry } from "../../domain/interfaces";
import { RouteCreated, RouteCacheHit, RouteCacheMiss } from "../../domain/events";
import { RouteSession } from "../../domain/entities/route-session.entity";
import { crypto } from "../../infrastructure/utils/crypto";
import { SessionCache } from "../../infrastructure/cache/session.cache";
import { PlanRouteUseCase } from "./plan-route.use-case";

export interface CreateRouteSessionCommand {
  deliveryId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  stops?: { lat: number; lng: number }[];
  profile: string;
}

const ROUTE_CACHE_TTL = 3600;

export class CreateRouteSessionUseCase {
  constructor(
    private readonly sessionRepo: IRouteSessionRepository,
    private readonly planRoute: PlanRouteUseCase,
    private readonly cache: ICache,
    private readonly sessionCache: SessionCache,
    private readonly logger: Logger,
    private readonly metrics: IMetricsRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: CreateRouteSessionCommand): Promise<{
    session: RouteSession;
    cached: boolean;
  }> {
    const cacheKey = this.buildCacheKey(command);
    const cachedRoutes = await this.cache.get<any[]>(cacheKey);

    if (cachedRoutes && cachedRoutes.length > 0) {
      this.logger.info("Route session cache hit", { cacheKey, deliveryId: command.deliveryId });
      await this.eventBus.publish(new RouteCacheHit(cacheKey, null, cachedRoutes[0].provider, command.profile));
      return { session: await this.persistResults(command, cachedRoutes[0], true), cached: true };
    }

    const start = Date.now();
    const result = await this.planRoute.execute({
      origin: command.origin,
      destination: command.destination,
      stops: command.stops,
      profile: command.profile,
      alternatives: 0,
      steps: true,
    });
    const processingTimeMs = Date.now() - start;

    if (!result.routes.length) {
      throw new Error("No route found");
    }

    const route = result.routes[0];

    await this.cache.set(cacheKey, [{
      id: crypto.md5(command.deliveryId),
      geometry: route.geometry,
      distance: { value: route.distance.inMeters(), unit: "m" },
      duration: { value: route.duration.inSeconds(), unit: "s" },
      distanceText: route.distance.toText(),
      durationText: route.duration.toText(),
      provider: route.provider,
      steps: route.steps.map((s) => ({
        instruction: s.instruction,
        distance: { value: s.distance.inMeters(), unit: "m" },
        duration: { value: s.duration.inSeconds(), unit: "s" },
        type: s.type,
        modifier: s.modifier,
      })),
    }], ROUTE_CACHE_TTL);

    await this.eventBus.publish(new RouteCacheMiss(cacheKey, route.provider, command.profile));

    const session = await this.persistResults(command, route, false);

    await this.eventBus.publish(new RouteCreated(
      session.id, command.deliveryId, route.provider, command.profile, false, processingTimeMs,
    ));

    return { session, cached: false };
  }

  private async persistResults(
    command: CreateRouteSessionCommand,
    route: any,
    cacheHit: boolean,
  ): Promise<RouteSession> {
    const instructions = (route.steps || []).map((s: any) => ({
      instruction: s.instruction,
      distance: s.distance?.value ?? s.distance,
      duration: s.duration?.value ?? s.duration,
      type: s.type,
      modifier: s.modifier,
    }));

    const session = await this.sessionRepo.createSession({
      deliveryId: command.deliveryId,
      provider: route.provider,
      profile: command.profile,
      originLat: command.origin.lat,
      originLng: command.origin.lng,
      destLat: command.destination.lat,
      destLng: command.destination.lng,
      distanceMeters: route.distance?.value ?? route.distance,
      durationSeconds: route.duration?.value ?? route.duration,
      geometry: route.geometry,
      instructions: instructions.length ? instructions : null,
      routeHash: this.buildCacheKey(command),
    });

    await this.sessionCache.set({
      id: session.id,
      deliveryId: session.deliveryId,
      provider: session.provider,
      profile: session.profile,
      distanceMeters: session.distanceMeters,
      durationSeconds: session.durationSeconds,
      geometry: session.geometry,
      instructions: session.instructions,
      currentRevision: session.currentRevision,
      status: session.status,
    });

    return session;
  }

  private buildCacheKey(command: CreateRouteSessionCommand): string {
    const parts = [
      "route",
      `${command.origin.lat.toFixed(6)},${command.origin.lng.toFixed(6)}`,
      `${command.destination.lat.toFixed(6)},${command.destination.lng.toFixed(6)}`,
      ...(command.stops || []).map((s) => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`),
      command.profile,
    ];
    return crypto.md5(parts.join("|"));
  }
}
