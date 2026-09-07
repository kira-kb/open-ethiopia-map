import { IRouteProvider, RouteRequest, RouteResult } from "../../../domain/interfaces";
import { config } from "../../config";
import { Logger } from "../../../domain/interfaces";
import { IMetricsRegistry } from "../../../domain/interfaces";
import { IEventBus } from "../../../domain/interfaces";
import { ProviderFailed, RouteProviderChanged } from "../../../domain/events";
import { ReplanReason } from "../../../domain/entities";
import { OsrmRouteProvider } from "../route/osrm.provider";

interface ProviderHealthState {
  healthy: boolean;
  consecutiveFailures: number;
  lastCheckedAt: Date;
  lastFailureAt?: Date;
}

export class RouteProviderRegistry implements IRouteProvider {
  readonly name = "route-provider-registry";
  private providers = new Map<string, IRouteProvider>();
  private health = new Map<string, ProviderHealthState>();

  constructor(
    private readonly logger: Logger,
    private readonly metrics: IMetricsRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  register(provider: IRouteProvider): void {
    this.providers.set(provider.name, provider);
    this.health.set(provider.name, {
      healthy: true,
      consecutiveFailures: 0,
      lastCheckedAt: new Date(),
    });
    this.logger.info(`Registered route provider: ${provider.name}`);
  }

  private getPrimary(): string {
    return config.routeProvider.primary;
  }

  private getFallback(): string {
    return config.routeProvider.fallback;
  }

  async route(request: RouteRequest): Promise<RouteResult> {
    const start = Date.now();
    const primary = this.getPrimary();
    const fallback = this.getFallback();

    try {
      const result = await this.tryProvider(primary, request);
      this.metrics.observeHistogram("map_route_duration_ms", Date.now() - start, {
        provider: primary,
        profile: request.profile,
        cached: "false",
      });
      return result;
    } catch (err) {
      this.logger.warn(`Primary provider ${primary} failed, trying fallback`, {
        error: (err as Error).message,
      });
      this.recordFailure(primary);
      this.eventBus.publish(
        new ProviderFailed(
          primary,
          (err as Error).message,
          this.health.get(primary)?.consecutiveFailures || 1,
        ),
      );

      if (fallback && fallback !== primary) {
        try {
          const result = await this.tryProvider(fallback, request);
          this.metrics.observeHistogram("map_route_duration_ms", Date.now() - start, {
            provider: fallback,
            profile: request.profile,
            cached: "false",
          });
          this.eventBus.publish(
            new RouteProviderChanged(
              "",
              "",
              primary,
              fallback,
              ReplanReason.PROVIDER_FAILOVER,
            ),
          );
          return result;
        } catch (fallbackErr) {
          this.recordFailure(fallback);
          this.eventBus.publish(
            new ProviderFailed(
              fallback,
              (fallbackErr as Error).message,
              this.health.get(fallback)?.consecutiveFailures || 1,
            ),
          );
        }
      }

      const anyHealthy = this.findHealthy();
      if (anyHealthy) {
        try {
          const result = await this.tryProvider(anyHealthy, request);
          this.eventBus.publish(
            new RouteProviderChanged(
              "",
              "",
              primary,
              anyHealthy,
              ReplanReason.PROVIDER_FAILOVER,
            ),
          );
          return result;
        } catch {
          this.recordFailure(anyHealthy);
        }
      }

      throw new Error(`All route providers failed. Primary: ${primary}, Fallback: ${fallback}`);
    }
  }

  private async tryProvider(name: string, request: RouteRequest): Promise<RouteResult> {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Provider not registered: ${name}`);
    const result = await provider.route(request);
    const state = this.health.get(name);
    if (state) {
      state.healthy = true;
      state.consecutiveFailures = 0;
    }
    return result;
  }

  private isHealthy(name: string): boolean {
    return this.health.get(name)?.healthy !== false;
  }

  private recordFailure(name: string): void {
    const state = this.health.get(name);
    if (state) {
      state.consecutiveFailures++;
      state.lastFailureAt = new Date();
      if (state.consecutiveFailures >= 3) {
        state.healthy = false;
        this.eventBus.publish(new ProviderFailed(name, "3 consecutive failures", state.consecutiveFailures)).catch(() => {});
      }
    }
  }

  private findHealthy(): string | undefined {
    for (const [name, state] of this.health) {
      if (state.healthy && name !== this.getPrimary() && name !== this.getFallback()) {
        return name;
      }
    }
    return undefined;
  }

  async checkHealth(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    for (const [name] of this.providers) {
      if (name === "osrm") {
        const candidateUrls = [
          config.routeProvider.osrm.baseUrl,
          "https://router.project-osrm.org",
        ].filter(Boolean);

        let osrmHealthy = false;
        for (const baseUrl of candidateUrls) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(
              `${baseUrl}/route/v1/driving/38.7,9.0;38.8,9.1?overview=false`,
              { signal: controller.signal },
            );
            clearTimeout(timeout);
            if (res.ok || res.status === 400) {
              osrmHealthy = true;
              break;
            }
          } catch {
            // Try next candidate
          }
        }
        results.set("osrm", osrmHealthy);
        const state = this.health.get("osrm");
        if (state) {
          state.healthy = osrmHealthy;
          state.lastCheckedAt = new Date();
          if (osrmHealthy) state.consecutiveFailures = 0;
        }
      } else {
        const state = this.health.get(name);
        results.set(name, state?.healthy ?? false);
      }
    }
    return results;
  }
}
