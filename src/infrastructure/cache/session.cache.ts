import { ICache } from "../../domain/interfaces";
import { RouteGeometry, RouteInstruction } from "../../domain/entities/route-session.entity";

export interface CachedSession {
  id: string;
  deliveryId: string;
  provider: string;
  profile: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
  instructions: RouteInstruction[] | null;
  currentRevision: number;
  status: string;
}

const SESSION_TTL = 86400; // 24 hours

export class SessionCache {
  private readonly prefix = "session:";

  constructor(private readonly cache: ICache) {}

  private key(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  async get(sessionId: string): Promise<CachedSession | null> {
    return this.cache.get<CachedSession>(this.key(sessionId));
  }

  async set(session: CachedSession): Promise<void> {
    await this.cache.set(this.key(session.id), session, SESSION_TTL);
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.cache.del(this.key(sessionId));
  }
}
