import { Coordinates } from "../value-objects";
import type { RouteGeometry, RouteStep } from "./route.entity";

export type { RouteGeometry };

export interface RouteInstruction {
  instruction: string;
  distance: number;
  duration: number;
  type: string;
  modifier: string;
}

export enum ReplanReason {
  INITIAL = "INITIAL",
  DRIVER_REQUEST = "DRIVER_REQUEST",
  TRAFFIC = "TRAFFIC",
  ROAD_CLOSED = "ROAD_CLOSED",
  PROVIDER_FAILOVER = "PROVIDER_FAILOVER",
  SYSTEM = "SYSTEM",
}

export type RouteSessionStatus = "active" | "completed" | "cancelled";

export class RouteRevision {
  constructor(
    readonly id: string,
    readonly sessionId: string,
    readonly version: number,
    readonly provider: string,
    readonly profile: string,
    readonly geometry: RouteGeometry,
    readonly distanceMeters: number,
    readonly durationSeconds: number,
    readonly instructions: RouteInstruction[] | null,
    readonly reason: ReplanReason,
    readonly processingTimeMs: number | null,
    readonly cacheHit: boolean,
    readonly createdAt: Date,
    readonly previousRevisionId: string | null = null,
  ) {}
}

export class RouteSession {
  constructor(
    readonly id: string,
    readonly deliveryId: string,
    readonly provider: string,
    readonly profile: string,
    readonly origin: Coordinates,
    readonly destination: Coordinates,
    readonly distanceMeters: number,
    readonly durationSeconds: number,
    readonly geometry: RouteGeometry,
    readonly instructions: RouteInstruction[] | null,
    readonly routeHash: string,
    readonly currentRevision: number,
    readonly status: RouteSessionStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly revisions: RouteRevision[] = [],
  ) {}

  get isActive(): boolean {
    return this.status === "active";
  }

  get latestRevision(): RouteRevision | undefined {
    return this.revisions.find((r) => r.version === this.currentRevision);
  }
}
