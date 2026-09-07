import { ICache } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { config } from "../config";

type RedisClient = import("ioredis").Redis;

export class RedisCache implements ICache {
  private client: RedisClient | null = null;
  private connected = false;

  constructor(
    private readonly logger: Logger,
    private readonly prefix: string = "map:",
  ) {
    try {
      const Redis = require("ioredis").default;
      const client: RedisClient = new Redis(config.redis.url, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
        lazyConnect: true,
        connectTimeout: 1500,
      });
      client.on("error", () => {
        this.connected = false;
      });
      client.on("connect", () => {
        this.connected = true;
      });
      client.on("close", () => {
        this.connected = false;
      });
      this.client = client;
    } catch {
      this.client = null;
      this.connected = false;
    }
  }

  async connect(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.connect();
    } catch (err) {
      this.connected = false;
      this.logger.warn("Redis unavailable, running without cache", { error: (err as Error).message });
    }
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) return null;
    try {
      const raw = await this.client.get(this.key(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const k = this.key(key);
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(k, ttlSeconds, serialized);
      } else {
        await this.client.set(k, serialized);
      }
    } catch {
      // Gracefully ignore cache write failures
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.del(this.key(key));
    } catch {
      // Ignore
    }
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.connected || !this.client) return 0;
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
      return deleted;
    } catch {
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;
    try {
      const result = await this.client.exists(this.key(key));
      return result === 1;
    } catch {
      return false;
    }
  }

  async increment(key: string): Promise<number> {
    if (!this.connected || !this.client) return 0;
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
