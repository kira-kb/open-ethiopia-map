import { IRouteSessionRepository } from "../../domain/interfaces/route-session-repository.interface";
import { SessionCache } from "../../infrastructure/cache/session.cache";
import { IEventBus } from "../../domain/interfaces";
import { RouteCompleted } from "../../domain/events/route-session.events";

export interface CloseRouteSessionCommand {
  sessionId: string;
  reason: "completed" | "cancelled";
}

export class CloseRouteSessionUseCase {
  constructor(
    private readonly repo: IRouteSessionRepository,
    private readonly cache: SessionCache,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: CloseRouteSessionCommand): Promise<void> {
    const session = await this.repo.findSessionById(command.sessionId);
    if (!session) return;

    if (session.status !== "active") return;

    const status = command.reason === "completed" ? "completed" : "cancelled";
    await this.repo.updateSessionStatus(command.sessionId, status);

    await this.cache.invalidate(command.sessionId);

    await this.eventBus.publish(
      new RouteCompleted(
        command.sessionId,
        session.deliveryId,
        session.currentRevision,
        session.provider,
      ),
    );
  }
}
