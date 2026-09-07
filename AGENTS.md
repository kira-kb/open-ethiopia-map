# AGENTS.md — Map Service Architecture

## Overview

PackMan Map Service is a standalone Express.js microservice that acts as the **canonical routing and location intelligence authority**. It uses DDD (Domain-Driven Design) with four layers: Domain, Application, Infrastructure, Presentation. It has its own PostgreSQL database (`packman_maps`) and Redis cache, and is consumed by customer app, driver app, and data-service.

> **Port**: 8084 (default)

---

## Architecture Layers

### Domain Layer (`src/domain/`)
Pure business logic — zero infrastructure dependencies.

| Component | Location | Purpose |
|---|---|---|
| **Entities** | `entities/` | Place, Location, RouteSession, RouteRevision, LocationEnrichment, LocationConfidence, PackManRoute, SearchResult, etc. |
| **Value Objects** | `value-objects/` | Coordinates (haversine, toKey), Distance, Duration, RouteProfile |
| **Interfaces** | `interfaces/` | IPlaceRepository, IRouteSessionRepository, ICache, IEventBus, IRouteProvider, IGeocodeProvider, IRecommendationCache, IRecommendationEngine, ISearchSource, Logger, IMetricsRegistry, IWorker |
| **Events** | `events/` | 21 domain events — Location (PlaceImported, LocationEnriched, etc.), Delivery (DeliveryCompleted, DeliveryFailedLocation, etc.), Route Session (RouteCreated, RouteReplanned, DriverOffRoute, etc.) |
| **Services** | `services/ranking/` | RankingPipeline, RankingEngine, DefaultRankingStrategy, PopularityRankingStrategy, HybridRankingStrategy |
| **Services** | `services/recommendation/` | RecommendationEngine (deterministic name recommendation, no AI) |

### Application Layer (`src/application/`)
Use cases — orchestrate domain logic.

| Use Case | File | Purpose |
|---|---|---|
| **PlanRouteUseCase** | `use-cases/plan-route.use-case.ts` | Compute route via provider registry, cache result by MD5 hash |
| **ReverseGeocodeUseCase** | `use-cases/reverse-geocode.use-case.ts` | Convert lat/lng to address (DB first, then provider fallback) |
| **SearchPlacesUseCase** | `use-cases/search-places.use-case.ts` | Multi-source autocomplete search pipeline |
| **NearbySearchUseCase** | `use-cases/nearby-search.use-case.ts` | Find places within radius of a point |
| **CreateRouteSessionUseCase** | `use-cases/create-route-session.use-case.ts` | Create canonical route session for a delivery |
| **GetRouteSessionUseCase** | `use-cases/get-route-session.use-case.ts` | Retrieve session by ID or deliveryId (write-through cache) |
| **ReplanRouteSessionUseCase** | `use-cases/replan-route-session.use-case.ts` | Replan route, create immutable revision, detect provider change |
| **CloseRouteSessionUseCase** | `use-cases/close-route-session.use-case.ts` | Close session on delivery complete/cancel |
| **CheckDeviationUseCase** | `use-cases/check-deviation.use-case.ts` | Check if GPS point deviates >100m from route geometry |
| **GetRouteHistoryUseCase** | `use-cases/get-route-history.use-case.ts` | Retrieve all revisions for audit trail |
| **SearchPipeline** | `use-cases/search-pipeline.ts` | Internal — orchestrates 4 search sources with ranking |

### Infrastructure Layer (`src/infrastructure/`)
Implements domain interfaces — database, cache, providers, workers.

| Component | Location | Purpose |
|---|---|---|
| **PrismaPlaceRepository** | `database/prisma-place.repository.ts` | IPlaceRepository — raw SQL for search/haversine, CRUD for SavedPlace |
| **PrismaRouteSessionRepository** | `database/prisma-route-session.repository.ts` | IRouteSessionRepository — session + revision persistence |
| **RedisCache** | `cache/redis.cache.ts` | ICache — ioredis with `map:` prefix, graceful degradation |
| **RecommendationCache** | `cache/recommendation.cache.ts` | IRecommendationCache — per-coordinate, 7-day TTL |
| **SessionCache** | `cache/session.cache.ts` | Route session cache — 24h TTL |
| **OsrmRouteProvider** | `providers/osrm-route.provider.ts` | IRouteProvider — OSRM HTTP API |
| **PhotonGeocodeProvider** | `providers/photon-geocode.provider.ts` | IGeocodeProvider — Photon (Komoot) API |
| **RouteProviderRegistry** | `providers/route-provider.registry.ts` | IRouteProvider — primary/fallback with health tracking |
| **InMemoryEventBus** | `queue/in-memory-event-bus.ts` | IEventBus — process-local pub/sub |
| **CircuitBreaker** | `resilience/circuit-breaker.ts` | CLOSED/OPEN/HALF_OPEN state machine |
| **Search Sources** | `search-sources/` | SavedPlacesSource (priority 100), PackManLocationsSource (75), RecommendationSource (50), ProviderSource (25) |
| **Workers** | `workers/` | PlaceImportWorker, CacheWarmWorker, ConfidenceWorker (commented out) |
| **Import/Scraping** | `importers/, scrapers/` | CsvImporter, ShoppingMallScraper, scraper registry |

### Presentation Layer (`src/presentation/`)
Express routes, controllers, DTOs.

| Route | Method | Controller |
|---|---|---|
| `/api/v1/map/route` | POST | RouteController.plan() |
| `/api/v1/map/autocomplete` | GET | AutocompleteController.search() |
| `/api/v1/map/reverse-geocode` | GET | ReverseGeocodeController.lookup() |
| `/api/v1/map/nearby` | GET | NearbyController.search() |
| `/api/v1/map/location-enrichment` | POST | EnrichmentController.save() |
| `/api/v1/map/saved-places` | GET | SavedPlacesController.list() |
| `/api/v1/map/saved-places/:id` | PUT | SavedPlacesController.update() |
| `/api/v1/map/saved-places/:id` | DELETE | SavedPlacesController.delete() |
| `/api/v1/map/routes/create` | POST | RouteSessionController.create() |
| `/api/v1/map/routes/session/:id` | GET | RouteSessionController.get() |
| `/api/v1/map/routes/session/:id/replan` | POST | RouteSessionController.replan() |
| `/api/v1/map/routes/session/:id/close` | POST | RouteSessionController.close() |
| `/api/v1/map/routes/session/:id/check-deviation` | POST | RouteSessionController.checkDeviation() |
| `/api/v1/map/routes/session/:id/history` | GET | RouteSessionController.getHistory() |
| `/health` | GET | HealthController.check() |

---

## Major Systems & Progress

### 1. Route Session System — 60%

**Goal**: Canonical, immutable, provider-independent planned route per delivery.

| Phase | Status |
|---|---|
| 1 — Delivery Ownership | Done |
| 2 — Automatic Session Creation | Done |
| 3 — Canonical Route Authority | Done |
| 4 — Session Cache | Done |
| 5 — Driver Replanning (deviation check + guard) | Done |
| 6 — Session Completion | Done |
| 7 — Customer Route Flow | Partly Done |
| 8 — Driver Route Flow | Partly Done |
| 9 — Route Audit (immutable revisions + previousRevisionId chain) | Done |
| 10 — Provider Switching (event defined, never fires) | Partly Done |
| 11 — Event Integration (Redis pub/sub bridge) | Not Started |
| 12 — Tracking Separation (planned vs actual) | Done |
| 13 — Architecture Validation | Not Started |

**Key files**:
- `src/domain/entities/route-session.entity.ts` — RouteSession aggregate, RouteRevision, ReplanReason enum
- `src/application/use-cases/create-route-session.use-case.ts`
- `src/application/use-cases/replan-route-session.use-case.ts`
- `src/application/use-cases/close-route-session.use-case.ts`
- `src/application/use-cases/check-deviation.use-case.ts`
- `src/application/use-cases/get-route-session.use-case.ts`
- `src/application/use-cases/get-route-history.use-case.ts`
- `src/infrastructure/database/prisma-route-session.repository.ts`
- `src/infrastructure/cache/session.cache.ts`
- `src/presentation/controllers/route-session.controller.ts`
- `docs/ROUTE_SESSION_IMPLEMENTATION_PLAN.md`

**Remaining**:
- Register second route provider (GraphHopper) so RouteProviderChanged fires (Phase 10)
- Bridge delivery-service Redis pub/sub to InMemoryEventBus (Phase 11)
- Architecture validation pass (Phase 13)
- Remove app fallback routing code once sessions are guaranteed

---

### 2. Location Intelligence Platform — 70%

**Goal**: Normalized, provider-independent location management with enrichment and delivery-outcome confidence.

| Component | Status |
|---|---|
| Location entity + provider records | Done |
| Location aliases (multi-language) | Done |
| Location hierarchy (parent-child containment) | Done |
| Location access metadata | Done |
| Location enrichment (user-provided delivery metadata) | Done |
| Location confidence (delivery-outcome scoring) | Done |
| Saved places (soft-delete, multi-user) | Done |
| Recommendation engine (deterministic) | Done |
| Search pipeline (4 sources, ranked, deduped) | Done |
| ConfidenceWorker (subscribes to delivery events) | Commented out |

**Key files**:
- `src/domain/entities/location.entity.ts`
- `src/domain/entities/location-enrichment.entity.ts`
- `src/domain/entities/location-confidence.entity.ts`
- `src/domain/entities/location-recommendation.entity.ts`
- `src/domain/entities/location-alias.entity.ts`
- `src/domain/entities/location-access.entity.ts`
- `src/domain/entities/location-hierarchy.entity.ts`
- `src/domain/entities/location-provider-record.entity.ts`
- `src/domain/entities/location-identity.entity.ts`
- `src/domain/entities/search-result.entity.ts`
- `src/domain/services/recommendation/RecommendationEngine.ts`
- `src/domain/services/ranking/RankingPipeline.ts`
- `src/infrastructure/workers/confidence.worker.ts`

**Remaining**:
- Prisma-backed enrichment/confidence repositories (currently in-memory)
- ConfidenceWorker un-comment once event bridge exists
- Prisma migration for Location models

---

### 3. Legacy Place System — 90%

**Goal**: Backward-compatible place search and management.

| Component | Status |
|---|---|
| Place search (ILIKE + tsvector) | Done |
| Nearby search (haversine SQL) | Done |
| Saved places CRUD | Done |
| Reverse geocode (DB + Photon) | Done |
| Legacy RecommendCache | Done |
| Legacy PlaceConfirmation | Done |
| Legacy RouteHistory | Done |

---

### 4. Provider System — 50%

**Goal**: Provider-agnostic routing and geocoding with failover.

| Component | Status |
|---|---|
| OsrmRouteProvider | Done |
| RouteProviderRegistry (primary/fallback, health tracking) | Done |
| PhotonGeocodeProvider | Done |
| GeocodeProviderRegistry | Done |
| Circuit breaker (3 consecutive failures) | Done |
| ProviderHealth persistence | Done |
| Second route provider (GraphHopper) | Not Started |
| RouteProviderChanged event wiring | Not Started |

---

### 5. Infrastructure — 80%

| Component | Status |
|---|---|
| Redis cache with graceful degradation | Done |
| Session cache (24h TTL) | Done |
| Recommendation cache (7d TTL) | Done |
| Route computation cache (1h TTL, MD5 hash) | Done |
| InMemoryEventBus | Done |
| Structured JSON logger | Done |
| Metrics registry (noop) | Done |
| TTL refresh on cache access | Not Implemented |
| Revision cache (individual revision lookup) | Not Implemented |

---

## Key Architectural Decisions

1. **Manual constructor injection** — No DI framework. All wiring in `main()` in `index.ts`.

2. **Separate Prisma client** for route session (`PrismaPg` adapter) — avoids conflict with the main Prisma client used for place operations.

3. **Raw SQL for geospatial** — Place repository uses `ILIKE` + haversine distance in raw SQL rather than PostGIS extension.

4. **Prisma ORM for route sessions** — Simpler CRUD, no geospatial queries needed.

5. **Dual coordinate hashing** — `Coordinates.toKey()` uses 6 decimal places (delivery stats matching); `makeCoordHash()` in enrichment uses 4 decimal places (rounded). Both deterministic.

6. **Confidence is NOT boosted by enrichment** — User clicks do NOT increase map confidence. Only real delivery outcomes (completed, failed, corrected, driver help) affect `LocationConfidence`.

7. **Immutable route revisions** — Every re-plan creates a new `RouteRevision` with `previousRevisionId` chain. Old revisions never modified.

8. **Event-driven but not yet bridged** — `InMemoryEventBus` exists with all event types defined. Delivery-service uses Redis pub/sub. No bridge connects them. HTTP calls from data-service are a pragmatic workaround.

9. **Graceful degradation everywhere** — Redis unavailable = no cache. Provider fails = fallback. Session creation fails = delivery works without session (apps use fallback routing).

---

## Data Flow Diagrams

### Route Session Lifecycle
```
Delivery created (data-service)
  → HTTP POST /api/v1/map/routes/create
  → CreateRouteSessionUseCase
  → PlanRouteUseCase → RouteProviderRegistry → OSRM
  → Persist RouteSession + RouteRevision v1
  → Write session:cache (24h TTL)
  → Publish RouteCreated event
  → Return sessionId to data-service
  → data-service stores routeSessionId on Delivery

Driver opens delivery
  → GET /api/v1/map/routes/session/:id
  → GetRouteSessionUseCase
  → Check session:cache (miss) → DB fetch → warm cache
  → Return geometry + instructions

Driver presses "Re-plan Route"
  → POST /api/v1/map/routes/session/:id/check-deviation
  → POST /api/v1/map/routes/session/:id/replan
  → ReplanRouteSessionUseCase
  → Create RouteRevision v2 (immutable)
  → Bump currentRevision on session
  → Invalidate session:cache
  → Publish RouteReplanned event

Delivery completed/cancelled
  → HTTP POST /api/v1/map/routes/session/:id/close
  → CloseRouteSessionUseCase
  → Set status = "completed" | "cancelled"
  → Invalidate session:cache
  → Publish RouteCompleted event
```

### Search + Enrichment Pipeline
```
User types query
  → GET /api/v1/map/autocomplete?q=...
  → SearchPlacesUseCase
  → SearchPipeline (4 sources in priority order)
    1. SavedPlacesSource (user's saved places)
    2. PackManLocationsSource (local Place DB)
    3. RecommendationSource (cached recommendations)
    4. ProviderSource (Photon geocode API)
  → RankingPipeline (dedup by LocationIdentity hash → weight → score → limit)
  → Cache per user segment (6h TTL)
  → Publish SearchPerformed event

User selects a place
  → LocationDetailsSheet opens
  → User fills enrichment fields
  → POST /api/v1/map/location-enrichment
  → EnrichmentController.save()
  → Create LocationEnrichment record
  → Update RecommendationCache (accepted name only, NO confidence boost)
  → Optionally save to SavedPlace
  → Publish LocationEnriched event
  → [Future] Delivery events → ConfidenceWorker → LocationConfidence updated
```

---

## Database Models

### Prisma Schema (`prisma/schema.prisma`)

**Route Session Models**:
- `RouteSession` — deliveryId (unique), provider, profile, origin/dest, geometry (GeoJSON), instructions, routeHash, currentRevision, status
- `RouteRevision` — sessionId, version, previousRevisionId (self-referential), provider, profile, geometry, distance, duration, instructions, reason, processingTimeMs, cacheHit

**Location Intelligence Models**:
- `Location` — name, normalizedName, lat/lng, locationType, category, verified, full address
- `LocationProviderRecord` — source, providerPlaceId, providerMetadata
- `LocationAlias` — alias, language, isPreferred
- `LocationGeometry` — geometryType, coordinates, precision
- `LocationHierarchy` — parentId, relationType, depth (self-referential)
- `LocationAccess` — gate, security, elevator, parking, hours, notes
- `LocationEnrichment` — userId, suggestedName, finalName, locationType, extraDetails, coordHash, savePlace, savedLabel
- `LocationConfidence` — coordHash (unique), successfulDeliveries, failedDeliveries, driverCorrections, confidenceScore, confidenceLevel
- `LocationRecommendation` — coordHash (unique), recommendedName, acceptedNames[], enrichmentCount, deliveryCount, providerScore
- `SavedPlace` — userId, label, latitude, longitude, locationType, isDefault, deletedAt (soft delete)

**Legacy Models**:
- `Place` — full denormalized place with popularity, confidence, search/selection counts
- `RecommendCache` — per-coordinate recommendation (legacy)
- `PlaceConfirmation` — user confirmations (legacy)
- `SearchHistory` — search analytics (legacy)
- `RouteHistory` — route computation audit (legacy)
- `ProviderHealth` — HEALTHY/DEGRADED/UNHEALTHY
- `TrafficSegment`, `CacheStatistics`, `ImportJob`, `ScraperRun`, `ImportAudit`, `ScraperAudit`

---

## What's Left

### Route Session (Phases 7–13)
- [ ] **Phase 7 — Customer Route Flow**: Remove OSRM fallback once all deliveries have sessions
- [ ] **Phase 8 — Driver Route Flow**: Remove multi-provider fallback once sessions guaranteed
- [ ] **Phase 10 — Provider Switching**: Register GraphHopper as second provider; verify RouteProviderChanged fires on failover
- [ ] **Phase 11 — Event Integration**: Build Redis pub/sub → InMemoryEventBus bridge; connect DeliveryCreated→CreateRouteSession, DeliveryCompleted→CloseRouteSession
- [ ] **Phase 13 — Architecture Validation**: Review all phases for consistency, verify no duplicated geometry/logic, DDD boundaries preserved
- [ ] **Cleanup**: Visual "off route" indicator on driver map; TTL refresh on cache access; RevisionCache for individual revision lookup

### Location Intelligence
- [ ] Prisma-backed enrichment repository (currently in-memory array)
- [ ] Un-comment ConfidenceWorker once delivery event bridge exists
- [ ] Prisma migration for Location, LocationEnrichment, LocationConfidence, and all new location models

### Provider System
- [ ] Register GraphHopper as a second IRouteProvider
- [ ] Wire RouteProviderChanged event publishing in failover scenarios
- [ ] Test circuit breaker behavior with dual providers
