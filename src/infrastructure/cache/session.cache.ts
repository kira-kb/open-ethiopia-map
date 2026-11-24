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

  private deliveryKey(deliveryId: string): string {
    return `${this.prefix}delivery:${deliveryId}`;
  }

  async get(sessionId: string): Promise<CachedSession | null> {
    const data = await this.cache.get<CachedSession>(this.key(sessionId));
    if (data && data.status === "active") {
      // Sliding TTL: Refresh expiration on active sessions so long routes don't evict
      await this.cache.set(this.key(sessionId), data, SESSION_TTL);
      if (data.deliveryId) {
        await this.cache.set(this.deliveryKey(data.deliveryId), sessionId, SESSION_TTL);
      }
    }
    return data;
  }

  async getSessionIdByDeliveryId(deliveryId: string): Promise<string | null> {
    return this.cache.get<string>(this.deliveryKey(deliveryId));
  }

  async set(session: CachedSession): Promise<void> {
    await this.cache.set(this.key(session.id), session, SESSION_TTL);
    if (session.deliveryId) {
      await this.cache.set(this.deliveryKey(session.deliveryId), session.id, SESSION_TTL);
    }
  }

  async invalidate(sessionId: string, deliveryId?: string): Promise<void> {
    await this.cache.del(this.key(sessionId));
    if (deliveryId) {
      await this.cache.del(this.deliveryKey(deliveryId));
    }
  }
}
