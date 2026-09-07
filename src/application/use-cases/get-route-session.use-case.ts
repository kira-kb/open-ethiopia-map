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

    // Populate cache on read-through for subsequent requests
    const cached = await this.sessionCache.get(sessionId);
    if (!cached) {
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
    }

    return session;
  }

  async executeByDeliveryId(deliveryId: string): Promise<RouteSession | null> {
    return this.sessionRepo.findSessionByDeliveryId(deliveryId);
  }
}
