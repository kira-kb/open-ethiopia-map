import { Request, Response, NextFunction } from "express";
import { ICache } from "../../domain/interfaces";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter(cache?: ICache, options?: RateLimiterOptions) {
  const windowMs = options?.windowMs || 60000; // 1 minute default
  const max = options?.max || 100;
  const message = options?.message || "Too many requests, please try again later.";

  // In-memory fallback if Redis is unavailable
  const memoryHits = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const clientKey = `ratelimit:${String(ip).split(",")[0].trim()}:${req.baseUrl || ""}`;
    const now = Date.now();

    try {
      if (cache) {
        const currentCount = (await cache.get<number>(clientKey)) || 0;
        if (currentCount >= max) {
          res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
          res.status(429).json({
            success: false,
            error: message,
            limit: max,
            windowMs,
          });
          return;
        }

        await cache.set(clientKey, currentCount + 1, Math.ceil(windowMs / 1000));
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, max - currentCount - 1));
        return next();
      }
    } catch {
      // Fallback to memory store if cache error occurs
    }

    // Memory fallback logic
    const record = memoryHits.get(clientKey);
    if (!record || now > record.resetTime) {
      memoryHits.set(clientKey, { count: 1, resetTime: now + windowMs });
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    if (record.count >= max) {
      res.setHeader("Retry-After", Math.ceil((record.resetTime - now) / 1000));
      res.status(429).json({
        success: false,
        error: message,
        limit: max,
        windowMs,
      });
      return;
    }

    record.count++;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    next();
  };
}
