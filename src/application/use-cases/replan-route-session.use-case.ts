import {
  IRouteSessionRepository,
} from "../../domain/interfaces/route-session-repository.interface";
import { IEventBus, Logger } from "../../domain/interfaces";
import { RouteReplanned, RouteProviderChanged } from "../../domain/events";
import { RouteSession, RouteRevision, ReplanReason } from "../../domain/entities/route-session.entity";
import { SessionCache } from "../../infrastructure/cache/session.cache";
import { PlanRouteUseCase } from "./plan-route.use-case";

export interface ReplanRouteSessionCommand {
  sessionId: string;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  stops?: { lat: number; lng: number }[];
  profile?: string;
  reason: ReplanReason;
}

export class ReplanRouteSessionUseCase {
  constructor(
    private readonly sessionRepo: IRouteSessionRepository,
    private readonly planRoute: PlanRouteUseCase,
    private readonly sessionCache: SessionCache,
    private readonly logger: Logger,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: ReplanRouteSessionCommand): Promise<{
    session: RouteSession;
    revision: RouteRevision;
  }> {
    const session = await this.sessionRepo.findSessionById(command.sessionId);
    if (!session) throw new Error("Route session not found");

    const newVersion = session.currentRevision + 1;
    const origin = command.origin || { lat: session.origin.latitude, lng: session.origin.longitude };
    const destination = command.destination || { lat: session.destination.latitude, lng: session.destination.longitude };
    const profile = command.profile || session.profile;
    const oldProvider = session.provider;

    const start = Date.now();
    const result = await this.planRoute.execute({
      origin,
      destination,
      stops: command.stops,
      profile,
      alternatives: 0,
      steps: true,
    });
    const processingTimeMs = Date.now() - start;

    if (!result.routes.length) {
      throw new Error("No route found for replan");
    }

    const route = result.routes[0];

    const instructions = (route.steps || []).map((s: any) => ({
      instruction: s.instruction,
      distance: s.distance?.value ?? s.distance,
      duration: s.duration?.value ?? s.duration,
      type: s.type,
      modifier: s.modifier,
    }));

    const revision = await this.sessionRepo.createRevision({
      sessionId: command.sessionId,
      version: newVersion,
      previousRevisionId: session.revisions.find((r) => r.version === newVersion - 1)?.id ?? null,
      provider: route.provider,
      profile,
      geometry: route.geometry,
      distanceMeters: route.distance?.value ?? route.distance,
      durationSeconds: route.duration?.value ?? route.duration,
      instructions: instructions.length ? instructions : null,
      reason: command.reason,
      processingTimeMs,
      cacheHit: result.cached,
    });

    await this.sessionRepo.bumpRevision(command.sessionId, newVersion);
    await this.sessionCache.invalidate(command.sessionId);

    if (route.provider !== oldProvider) {
      await this.eventBus.publish(new RouteProviderChanged(
        command.sessionId, session.deliveryId, oldProvider, route.provider, command.reason,
      ));
    }

    await this.eventBus.publish(new RouteReplanned(
      command.sessionId, session.deliveryId, newVersion, command.reason, route.provider, processingTimeMs,
    ));

    const updated = await this.sessionRepo.findSessionById(command.sessionId);
    if (!updated) throw new Error("Failed to load updated session");

    return { session: updated, revision };
  }
}
