import {
  IRouteSessionRepository,
} from "../../domain/interfaces/route-session-repository.interface";
import { Logger } from "../../domain/interfaces";
import { RouteSession } from "../../domain/entities/route-session.entity";
import { SessionCache } from "../../infrastructure/cache/session.cache";

export class GetRouteSessionUseCase {
  constructor(
    private readonly sessionRepo: IRouteSessionRepository,
    private readonly sessionCache: SessionCache,
    private readonly logger: Logger,
  ) {}

  async execute(sessionId: string): Promise<RouteSession | null> {
    const session = await this.sessionRepo.findSessionById(sessionId);
    if (!session) return null;

    // Populate/refresh write-through cache with sliding expiration
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

  async executeByDeliveryId(deliveryId: string): Promise<RouteSession | null> {
    // 1. Fast-path: check delivery cache index to resolve sessionId
    const cachedSessionId = await this.sessionCache.getSessionIdByDeliveryId(deliveryId);
    if (cachedSessionId) {
      const session = await this.sessionRepo.findSessionById(cachedSessionId);
      if (session) {
        // Refresh sliding TTL on active driver poll
        await this.sessionCache.get(cachedSessionId);
        return session;
      }
    }

    // 2. DB fallback
    const session = await this.sessionRepo.findSessionByDeliveryId(deliveryId);
    if (!session) return null;

    // 3. Warm the delivery index and session cache
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
}
