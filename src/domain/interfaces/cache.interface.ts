export interface CacheOptions {
  ttlSeconds?: number;
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  increment(key: string): Promise<number>;
  getAndSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}
