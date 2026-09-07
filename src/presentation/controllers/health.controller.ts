import { Request, Response } from "express";
import { RouteProviderRegistry } from "../../infrastructure/providers/registry";
import { config } from "../../infrastructure/config";

export class HealthController {
  private startTime = Date.now();

  constructor(
    private readonly routeRegistry?: RouteProviderRegistry,
  ) {}

  async check(_req: Request, res: Response): Promise<void> {
    let providerHealth: Record<string, boolean> = {};

    if (this.routeRegistry) {
      try {
        const results = await this.routeRegistry.checkHealth();
        for (const [name, healthy] of results) {
          providerHealth[name] = healthy;
        }
      } catch {
        providerHealth = { error: false };
      }
    }

    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      dependencies: {
        postgres: { status: "unknown" },
        redis: { status: "unknown" },
        ...Object.fromEntries(
          Object.entries(providerHealth).map(([name, healthy]) => [
            name,
            { status: healthy ? "healthy" : "unhealthy" },
          ]),
        ),
      },
    });
  }
}
