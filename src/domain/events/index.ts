export class PlaceImported {
  constructor(
    readonly placeId: string,
    readonly source: string,
    readonly confidence: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class PlaceUpdated {
  constructor(
    readonly placeId: string,
    readonly changes: string[],
    readonly timestamp: Date = new Date(),
  ) {}
}

export class RouteCalculated {
  constructor(
    readonly originKey: string,
    readonly destKey: string,
    readonly profile: string,
    readonly provider: string,
    readonly durationMs: number,
    readonly cached: boolean,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class SearchPerformed {
  constructor(
    readonly query: string,
    readonly resultCount: number,
    readonly provider: string,
    readonly responseTimeMs: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class ProviderFailed {
  constructor(
    readonly provider: string,
    readonly error: string,
    readonly consecutiveFailures: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class CacheInvalidated {
  constructor(
    readonly cacheKey: string,
    readonly cacheType: string,
    readonly reason: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class ImportCompleted {
  constructor(
    readonly jobId: string,
    readonly source: string,
    readonly importedRecords: number,
    readonly failedRecords: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class ScraperCompleted {
  constructor(
    readonly scraper: string,
    readonly runId: string,
    readonly placesImported: number,
    readonly failures: number,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class LocationEnriched {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string | undefined,
    readonly finalName: string,
    readonly userId: string | undefined,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class PlaceRecommended {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string,
    readonly recommendedName: string,
    readonly confidence: number,
    readonly locationType: string | undefined,
    readonly cached: boolean,
    readonly timestamp: Date = new Date(),
  ) {}
}

import { DeliveryCompleted, DeliveryAddressCorrected, DeliveryFailedLocation, DeliveryDriverRequestedHelp } from "./delivery-events";
export { DeliveryCompleted, DeliveryAddressCorrected, DeliveryFailedLocation, DeliveryDriverRequestedHelp };

import {
  RouteCreated, RouteReplanned, RouteCompleted,
  RouteCacheHit, RouteCacheMiss,
  DriverOffRoute, RouteProviderChanged,
} from "./route-session.events";
export {
  RouteCreated, RouteReplanned, RouteCompleted,
  RouteCacheHit, RouteCacheMiss,
  DriverOffRoute, RouteProviderChanged,
};

export type DomainEvent =
  | PlaceImported
  | PlaceUpdated
  | RouteCalculated
  | SearchPerformed
  | ProviderFailed
  | CacheInvalidated
  | ImportCompleted
  | ScraperCompleted
  | LocationEnriched
  | PlaceRecommended
  | DeliveryCompleted
  | DeliveryAddressCorrected
  | DeliveryFailedLocation
  | DeliveryDriverRequestedHelp
  | RouteCreated
  | RouteReplanned
  | RouteCompleted
  | RouteCacheHit
  | RouteCacheMiss
  | DriverOffRoute
  | RouteProviderChanged;
