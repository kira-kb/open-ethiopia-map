import {
  IRouteSessionRepository,
} from "../../domain/interfaces/route-session-repository.interface";
import { RouteRevision } from "../../domain/entities/route-session.entity";

export class GetRouteHistoryUseCase {
  constructor(
    private readonly sessionRepo: IRouteSessionRepository,
  ) {}

  async execute(sessionId: string): Promise<RouteRevision[]> {
    return this.sessionRepo.findRevisionsBySessionId(sessionId);
  }
}
