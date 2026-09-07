import Redis from "ioredis";
import { config } from "../config";
import { Logger, IEventBus } from "../../domain/interfaces";
import { CreateRouteSessionUseCase, CloseRouteSessionUseCase } from "../../application/use-cases";
import { ConfidenceWorker } from "./confidence.worker";
import {
  DeliveryCompleted,
  DeliveryAddressCorrected,
  DeliveryFailedLocation,
  DeliveryDriverRequestedHelp,
} from "../../domain/events";

export interface DeliveryLifecycleEventPayload {
  type:
    | "DELIVERY_CREATED"
    | "DELIVERY_COMPLETED"
    | "DELIVERY_CANCELLED"
    | "ADDRESS_CORRECTED"
    | "DELIVERY_FAILED_LOCATION"
    | "DRIVER_HELP_REQUESTED";
  deliveryId: string;
  routeSessionId?: string | null;
  pickups?: Array<{ lat: number; lng: number; order?: number }>;
  destination?: { lat: number; lng: number };
  dropLat?: number;
  dropLng?: number;
  vehicleType?: string;
  driverId?: string;
  reason?: string;
  firstAttempt?: boolean;
  timestamp?: string;
}

function makeCoordHash(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

export class RedisEventBridge {
  private subscriber: Redis | null = null;
  private isRunning = false;

  constructor(
    private readonly createRouteSessionUseCase: CreateRouteSessionUseCase,
    private readonly closeRouteSessionUseCase: CloseRouteSessionUseCase,
    private readonly confidenceWorker: ConfidenceWorker,
    private readonly eventBus: IEventBus,
    private readonly logger: Logger,
  ) {}

  start(): void {
    if (this.isRunning) return;

    try {
      this.subscriber = new Redis(config.redis.url, {
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        retryStrategy: () => null,
        lazyConnect: true,
        connectTimeout: 1500,
      });

      this.subscriber.on("error", () => {
        // Silently ignore if Redis host is not reachable
      });

      this.subscriber.connect()
        .then(() => {
          this.subscriber?.subscribe("delivery:lifecycle", (err) => {
            if (err) {
              this.logger.warn("RedisEventBridge subscription failed", { error: err.message });
            } else {
              this.logger.info("RedisEventBridge subscribed to delivery:lifecycle");
              this.isRunning = true;
            }
          });
        })
        .catch((err) => {
          this.logger.warn("RedisEventBridge disabled (Redis unavailable)", { error: (err as Error).message });
        });

      this.subscriber.on("message", async (channel: string, message: string) => {
        if (channel !== "delivery:lifecycle") return;
        try {
          const payload = JSON.parse(message) as DeliveryLifecycleEventPayload;
          await this.handleEvent(payload);
        } catch (parseErr) {
          this.logger.error("Failed to parse delivery lifecycle event", {
            error: (parseErr as Error).message,
          });
        }
      });
    } catch (err) {
      this.logger.warn("Failed to initialize RedisEventBridge", {
        error: (err as Error).message,
      });
    }
  }

  private async handleEvent(data: DeliveryLifecycleEventPayload): Promise<void> {
    this.logger.info("Processing delivery lifecycle event", {
      type: data.type,
      deliveryId: data.deliveryId,
    });

    switch (data.type) {
      case "DELIVERY_CREATED": {
        if (data.destination && data.pickups && data.pickups.length > 0) {
          const ordered = [...data.pickups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const origin = ordered[0];
          const stops = ordered.slice(1);

          try {
            await this.createRouteSessionUseCase.execute({
              deliveryId: data.deliveryId,
              origin: { lat: origin.lat, lng: origin.lng },
              destination: { lat: data.destination.lat, lng: data.destination.lng },
              stops: stops.length > 0 ? stops.map((s) => ({ lat: s.lat, lng: s.lng })) : undefined,
              profile: data.vehicleType === "bicycle" ? "cycling" : "driving",
            });
            this.logger.info("Route session created via Redis event bridge", {
              deliveryId: data.deliveryId,
            });
          } catch (createErr) {
            this.logger.error("Failed to create route session via Redis bridge", {
              deliveryId: data.deliveryId,
              error: (createErr as Error).message,
            });
          }
        }
        break;
      }

      case "DELIVERY_COMPLETED": {
        if (data.routeSessionId) {
          try {
            await this.closeRouteSessionUseCase.execute({
              sessionId: data.routeSessionId,
              reason: "completed",
            });
          } catch (closeErr) {
            this.logger.warn("Failed to close route session on delivery complete", {
              sessionId: data.routeSessionId,
              error: (closeErr as Error).message,
            });
          }
        }

        if (data.dropLat != null && data.dropLng != null) {
          const coordHash = makeCoordHash(data.dropLat, data.dropLng);
          const event = new DeliveryCompleted(
            undefined,
            coordHash,
            data.deliveryId,
            data.driverId,
            undefined,
            data.firstAttempt ?? true,
          );
          await this.confidenceWorker.handleDeliveryCompleted(event);
          await this.eventBus.publish(event);
        }
        break;
      }

      case "DELIVERY_CANCELLED": {
        if (data.routeSessionId) {
          try {
            await this.closeRouteSessionUseCase.execute({
              sessionId: data.routeSessionId,
              reason: "cancelled",
            });
          } catch (closeErr) {
            this.logger.warn("Failed to close route session on delivery cancel", {
              sessionId: data.routeSessionId,
              error: (closeErr as Error).message,
            });
          }
        }
        break;
      }

      case "ADDRESS_CORRECTED": {
        if (data.dropLat != null && data.dropLng != null) {
          const coordHash = makeCoordHash(data.dropLat, data.dropLng);
          const event = new DeliveryAddressCorrected(
            undefined,
            coordHash,
            data.deliveryId,
            data.reason || "CORRECTED",
          );
          await this.confidenceWorker.handleAddressCorrected(event);
          await this.eventBus.publish(event);
        }
        break;
      }

      case "DELIVERY_FAILED_LOCATION": {
        if (data.dropLat != null && data.dropLng != null) {
          const coordHash = makeCoordHash(data.dropLat, data.dropLng);
          const event = new DeliveryFailedLocation(
            undefined,
            coordHash,
            data.deliveryId,
            data.reason || "LOCATION_ERROR",
          );
          await this.confidenceWorker.handleDeliveryFailedLocation(event);
          await this.eventBus.publish(event);
        }
        break;
      }

      case "DRIVER_HELP_REQUESTED": {
        if (data.dropLat != null && data.dropLng != null) {
          const coordHash = makeCoordHash(data.dropLat, data.dropLng);
          const event = new DeliveryDriverRequestedHelp(
            undefined,
            coordHash,
            data.deliveryId,
            data.reason || "DRIVER_HELP_REQUESTED",
          );
          await this.confidenceWorker.handleDriverRequestedHelp(event);
          await this.eventBus.publish(event);
        }
        break;
      }
    }
  }

  stop(): void {
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    this.isRunning = false;
  }
}
