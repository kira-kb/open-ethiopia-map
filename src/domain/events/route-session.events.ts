import { ReplanReason } from "../entities/route-session.entity";

export class RouteCreated {
  constructor(
    readonly sessionId: string,
    readonly deliveryId: string,
    readonly provider: string,
    readonly profile: string,
    readonly cacheHit: boolean,
    readonly processingTimeMs: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteReplanned {
  constructor(
    readonly sessionId: string,
    readonly deliveryId: string,
    readonly version: number,
    readonly reason: ReplanReason,
    readonly provider: string,
    readonly processingTimeMs: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteCompleted {
  constructor(
    readonly sessionId: string,
    readonly deliveryId: string,
    readonly totalRevisions: number,
    readonly finalProvider: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteCacheHit {
  constructor(
    readonly routeHash: string,
    readonly sessionId: string | null,
    readonly provider: string,
    readonly profile: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteCacheMiss {
  constructor(
    readonly routeHash: string,
    readonly provider: string,
    readonly profile: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class DriverOffRoute {
  constructor(
    readonly sessionId: string,
    readonly deliveryId: string,
    readonly driverLat: number,
    readonly driverLng: number,
    readonly deviationMeters: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteProviderChanged {
  constructor(
    readonly sessionId: string,
    readonly deliveryId: string,
    readonly oldProvider: string,
    readonly newProvider: string,
    readonly reason: ReplanReason,
    readonly timestamp: Date = new Date(),
  ) {}
}
