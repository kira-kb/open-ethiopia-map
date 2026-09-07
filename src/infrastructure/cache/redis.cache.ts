import { ICache } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { config } from "../config";

type RedisClient = import("ioredis").Redis;

export class RedisCache implements ICache {
  private client: RedisClient;
  private connected = false;

  constructor(
    private readonly logger: Logger,
    private readonly prefix: string = "map:",
  ) {
    const Redis = require("ioredis").default;
    this.client = new Redis(config.redis.url, {
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.client.on("error", (err: Error) => {
      this.logger.error("Redis cache error", { error: err.message });
    });
    this.client.on("connect", () => {
      this.connected = true;
    });
    this.client.on("close", () => {
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(this.key(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn("Cache get failed", { key, error: (err as Error).message });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const k = this.key(key);
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(k, ttlSeconds, serialized);
      } else {
        await this.client.set(k, serialized);
      }
    } catch (err) {
      this.logger.warn("Cache set failed", { key, error: (err as Error).message });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(this.key(key));
    } catch (err) {
      this.logger.warn("Cache del failed", { key, error: (err as Error).message });
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.key(pattern);
      let cursor = "0";
      let deleted = 0;
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor, "MATCH", fullPattern, "COUNT", 100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== "0");
      if (deleted > 0) {
        this.logger.debug("Cache keys deleted by pattern", { pattern: fullPattern, count: deleted });
      }
      return deleted;
    } catch (err) {
      this.logger.warn("Cache delPattern failed", { pattern, error: (err as Error).message });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.key(key));
      return result === 1;
    } catch {
      return false;
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(this.key(key));
    } catch {
      return 0;
    }
  }

  async getAndSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached != null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
