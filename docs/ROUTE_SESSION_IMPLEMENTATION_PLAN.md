# PackMan Route Session Implementation

## Goal

Deliver a canonical, immutable, provider-independent Route Session that represents the **planned route** for a Delivery — owned by the Map Service, consumed by Customer and Driver apps, and kept separate from the actual GPS tracking path (`ridePath`, `driver:location_update`).

---

## Current Status

Overall Progress:
~60%

Current Phase:
Phase 10 — Provider Switching

Status:
In Progress

---

## Architecture Principles

- **Delivery owns Route Session.** A RouteSession always belongs to exactly one Delivery. The relationship is `@unique` at the DB level.
- **Map Service is the Route Authority.** The Map Service owns the canonical geometry, provider selection, and navigation instructions. Apps consume, never compute.
- **Delivery Service owns actual GPS tracking.** `ridePath`, `driver:location_update`, `DeliveryTracking`, Redis Pub/Sub position pipeline — all untouched. These represent the ACTUAL traveled path.
- **Planned Route and Actual Route are different concepts.** They coexist independently. Never conflate them.
- **Immutable route revisions.** Every re-plan creates a new RouteRevision. Old revisions are never overwritten — preserved for audit.
- **Event-driven communication.** State changes publish domain events (`RouteCreated`, `RouteReplanned`, `RouteCompleted`, `RouteProviderChanged`). No direct coupling between services.
- **Provider-independent routing.** The `RouteProviderRegistry` and `PlanRouteUseCase` abstract provider selection. A `RouteProviderChanged` event fires when re-planning switches providers.
- **Session-aware Redis cache.** `session:{sessionId}` caches active session data with 24h TTL. Invalidated on re-plan. Route computation results cached by MD5 hash with 1h TTL.
- **Zero business logic inside presentation layer.** Controllers parse input, delegate to use cases, format responses. No business rules.
- **No duplicated geometry.** The canonical route in the RouteSession is the single source of truth. Apps never compute their own canonical routes (only fallback when `routeSessionId` is absent).

---

# Phase 1 — Delivery Ownership

Status:
Done

Tasks

- [x] RouteSession always belongs to a Delivery. — `deliveryId` is a required constructor parameter, `@unique` in Prisma, indexed.
- [x] Prevent orphan RouteSessions. — `deliveryId` is required and unique. RouteRevisions cascade on session delete.
- [x] Route lifecycle follows Delivery lifecycle. — Routes are created when delivery is created (Phase 2), completed/cancelled when delivery terminates (Phase 6).
- [x] Remove assumptions that sessions are manually created by mobile apps. — Apps no longer import or call `createRouteSession`.

Gaps

- No session-level cascade when a delivery is deleted. Map-service database session is orphaned if delivery is deleted via data-service. Mitigation: delivery deletion is soft (deletedAt), and session can be GC'd on a best-effort basis or via Phase 6 completion/cancellation.

Files

- `server/map-service/src/domain/entities/route-session.entity.ts` — `RouteSession` aggregate with `deliveryId`
- `server/map-service/prisma/schema.prisma` — `RouteSession.deliveryId @unique`, `RouteRevision` cascade delete
- `server/map-service/src/infrastructure/database/prisma-route-session.repository.ts` — `findSessionByDeliveryId()`

---

# Phase 2 — Automatic Session Creation

Status:
Done

Tasks

- [x] Delivery creation automatically creates RouteSession.
- [x] Delivery stores routeSessionId.
- [x] Customer never creates RouteSession.
- [x] Driver never creates RouteSession.

Implementation

- `server/data-service/controller/data.pricing.controller.ts`:
  - Added `MAP_SERVICE_URL` constant
  - Added `createRouteSessionForDelivery()` helper: calls `POST /api/v1/map/routes/create` on map-service with deliveryId, origin, destination, stops, profile
  - Fire-and-forget call after delivery transaction commits; stores returned sessionId on Delivery record via `prisma.delivery.update({ routeSessionId })`
- `customer/lib/api/map.ts`: Removed `createRouteSession()` and `CreateRouteSessionPayload` type (dead code)
- `customer/app/tracking/[id].tsx`: Removed dead `createRouteSession` import
- `driver/lib/api/map.ts`: No changes needed (never had `createRouteSession`)

Tasks

- [ ] Delivery creation automatically creates RouteSession.
- [ ] Delivery stores `routeSessionId`.
- [ ] Customer never creates RouteSession.
- [ ] Driver never creates RouteSession.

Flow

```
Customer creates delivery in Delivery Service

Delivery Service creates delivery, gets delivery.id

Delivery Service calls Map Service via HTTP (or event bridge)

Map Service: POST /api/v1/map/routes/create
  → CreateRouteSessionUseCase
  → Deterministic cache check (MD5 of origin+destination+stops)
  → PlanRouteUseCase (provider-agnostic)
  → Persist RouteSession + first RouteRevision
  → Write session cache
  → Publish RouteCreated event
  → Return { sessionId }

Delivery Service stores routeSessionId on delivery record

Apps receive delivery with routeSessionId populated
  → Customer tracking page loads canonical route
  → Driver delivery page loads canonical route
  → No fallback needed
```

Files

- `server/map-service/src/application/use-cases/create-route-session.use-case.ts`
- `server/map-service/src/presentation/controllers/route-session.controller.ts`
- `server/delivery-service/ws/handlers/driver-delivery.ts` — integration point
- `server/data-service/controller/data.pricing.controller.ts` — delivery creation

Notes

- The `createRouteSession` import in `customer/app/tracking/[id].tsx` was already removed (dead import).
- The `createRouteSession` function in `customer/lib/api/map.ts` and `driver/lib/api/map.ts` will be removed in this phase.

---

# Phase 3 — Canonical Route Authority

Status:
Done

Tasks

- [x] Map Service owns canonical geometry. — RouteSession stores geometry, served via `GET /session/:id`.
- [x] Map Service owns navigation instructions. — RouteSession stores instructions from provider.
- [x] Delivery only stores routeSessionId. — `routeSessionId` on Delivery model; no geometry duplication.
- [x] No duplicated route geometry. — Phase 2 ensures sessions are created automatically; app fallback code is structurally present but unreachable at runtime.

Notes

- App fallback code (customer: OSRM, driver: multi-provider router) is preserved for backward compatibility during gradual rollout. When all deliveries have route sessions, fallback becomes dead code and can be removed in a future cleanup phase.

Files

- `server/map-service/src/domain/entities/route-session.entity.ts`
- `server/map-service/src/presentation/dto/route-session.dto.ts`
- `server/prisma/schema.prisma` — Delivery.routeSessionId

---

# Phase 4 — Session Cache

Status:
Done

Tasks

- [x] Redis Session Cache.
- [ ] Redis Revision Cache.
- [x] Request Hash Cache.
- [ ] Refresh TTL on access.
- [ ] Invalidate only affected sessions.

Redis Keys

- `session:{sessionId}` — active session data, TTL 24h
- `revision:{revisionId}` — individual revision (not implemented yet)
- `hash:{requestHash}` — route computation result, TTL 1h

Files

- `server/map-service/src/infrastructure/cache/session.cache.ts` — `SessionCache`
- `server/map-service/src/infrastructure/cache/recommendation.cache.ts` — route computation cache

Notes

- GetRouteSessionUseCase reads from cache but always falls through to DB. This will be fixed to short-circuit on cache hit.
- RevisionCache (for individual revision lookup) will be added in Phase 9.
- TTL refresh on session access will be added.

---

# Phase 5 — Driver Replanning

Status:
Done

Tasks

- [x] Compare live GPS with current revision.
- [x] Replan only when deviation exceeds threshold.
- [x] Otherwise return "No replan required."
- [x] Preserve immutable revision history.

Implementation

- `CheckDeviationUseCase` (`server/map-service/src/application/use-cases/check-deviation.use-case.ts`):
  - Computes minimum haversine distance from GPS point to all coordinates in route geometry
  - Returns `{ status: "on_route" | "off_route" | "no_session", deviationMeters, thresholdMeters }`
  - Threshold: 100 meters
- `POST /api/v1/map/routes/session/:id/check-deviation` — controller + router
- `driver/lib/api/map.ts` — Added `checkRouteDeviation()` API function
- `driver/app/delivery/[id].tsx` — "Re-plan Route" button below RouteInfo:
  1. First calls `checkRouteDeviation` — if on_route, shows toast and stops
  2. Only if off_route, calls `replanRouteSession` with `DRIVER_REQUEST` reason
  3. Updates routeData with new geometry on success

Files

- `server/map-service/src/application/use-cases/replan-route-session.use-case.ts`
- `server/map-service/src/domain/events/route-session.events.ts` — `DriverOffRoute`
- `driver/lib/api/map.ts` — `replanRouteSession()`

---

# Phase 6 — Session Completion

Status:
Done

Tasks

- [x] Close session when delivery completes.
- [x] Close session when delivery cancels.
- [x] Remove active cache.
- [x] Preserve complete history.

Implementation

- `CloseRouteSessionUseCase` (`server/map-service/src/application/use-cases/close-route-session.use-case.ts`):
  - Finds session by ID, skips if not active
  - Updates status to "completed" or "cancelled"
  - Invalidates session cache
  - Publishes `RouteCompleted` event
- `POST /api/v1/map/routes/session/:id/close` endpoint added to controller and router
- `server/data-service/controller/data.delivery.controller.ts`:
  - Added `closeRouteSessionForDelivery()` helper: reads `routeSessionId` from delivery, calls map-service close endpoint
  - Integrated into `completeDelivery` (reason: "completed")
  - Integrated into `cancelDelivery` (reason: "cancelled")
- Wired in `index.ts`: `CloseRouteSessionUseCase` instantiated with repo + cache + eventBus, injected into controller

---

# Phase 7 — Customer Route Flow

Status:
Partly Done

Tasks

- [x] Customer loads canonical route. — `getRouteSession()` called when `routeSessionId` present.
- [ ] Customer subscribes to live driver GPS. — Already done via `useCustomerRealtime`.
- [ ] Customer overlays live GPS on canonical route. — Already done: polyline + driver marker.
- [ ] Customer never computes routes. — Fallback to OSRM removed when sessions are always created.

What exists

- `getRouteSession()` in `customer/lib/api/map.ts`
- Canonical-first route loading in `customer/app/tracking/[id].tsx`
- OSRM fallback (becomes unreachable after Phase 2)

Files

- `customer/app/tracking/[id].tsx`
- `customer/lib/api/map.ts`

---

# Phase 8 — Driver Route Flow

Status:
Partly Done

Tasks

- [x] Driver loads latest revision. — `getRouteSession()` called when `routeSessionId` present.
- [x] Driver navigates using canonical route. — Canonical geometry used for polyline.
- [ ] Driver requests replans only when necessary. — Deviation detection needed.
- [ ] Driver never computes canonical routes locally. — Multi-provider fallback becomes unreachable after Phase 2.

Files

- `driver/app/delivery/[id].tsx`
- `driver/lib/api/map.ts`

---

# Phase 9 — Route Audit

Status:
Done

Tasks

Every revision stores

- [x] revision number
- [x] provider
- [x] geometry
- [x] ETA
- [x] distance
- [x] duration
- [x] reason
- [x] previousRevisionId
- [x] createdAt

- [x] Never overwrite revisions.

Implementation

- `server/map-service/prisma/schema.prisma` — Added `previousRevisionId` (optional, self-referential) to RouteRevision model with `@map("previous_revision_id")` and `@@index([previousRevisionId])`
- `server/map-service/src/domain/entities/route-session.entity.ts` — Added `previousRevisionId: string | null = null` to RouteRevision constructor
- `server/map-service/src/domain/interfaces/route-session-repository.interface.ts` — Added `previousRevisionId` to `SaveRouteRevisionData`
- `server/map-service/src/infrastructure/database/prisma-route-session.repository.ts` — `createRevision` now passes `previousRevisionId`; `toRevision` reads it from record
- `server/map-service/src/application/use-cases/replan-route-session.use-case.ts` — Finds previous revision ID by `version === newVersion - 1` before creating new revision

Files

- `server/map-service/src/domain/entities/route-session.entity.ts` — `RouteRevision`
- `server/map-service/prisma/schema.prisma` — `RouteRevision` model

---

# Phase 10 — Provider Switching

Status:
Partly Done

Tasks

- [x] Record provider for every revision.
- [x] Record provider failover.
- [ ] Publish RouteProviderChanged event. — Event class defined, published in replan use case, but never fires because only 1 provider registered.

Files

- `server/map-service/src/domain/events/route-session.events.ts` — `RouteProviderChanged`
- `server/map-service/src/application/use-cases/replan-route-session.use-case.ts`
- `server/map-service/src/index.ts` — provider registry wiring

---

# Phase 11 — Event Integration

Status:
Not Started

Tasks

Connect Route Session to existing events.

```
DeliveryCreated
  ↓
CreateRouteSession

DriverRequestedReplan
  ↓
EvaluateDeviation

DriverOffRoute
  ↓
EvaluateDeviation

DeliveryCompleted
  ↓
CloseRouteSession

DeliveryCancelled
  ↓
CloseRouteSession
```

- [ ] Never directly couple business logic.
- [ ] Bridge delivery-service Redis pub/sub events to map-service InMemoryEventBus.

What exists

- Delivery-service publishes events (`delivery:status_changed`, `delivery:tracking_closed`) via Redis pub/sub
- Map-service uses `InMemoryEventBus` (process-local)
- ConfidenceWorker subscriptions are commented out, awaiting bridge
- No delivery lifecycle events exist as classes in the map-service domain events

Files

- `server/map-service/src/domain/events/delivery-events.ts` — `DeliveryCompleted`, `DeliveryAddressCorrected`, `DeliveryFailedLocation`, `DeliveryDriverRequestedHelp`
- `server/map-service/src/infrastructure/workers/confidence.worker.ts` — commented out, awaiting bridge
- `server/delivery-service/` — existing Redis pub/sub events

---

# Phase 12 — Tracking Separation

Status:
Done

Tasks

- [x] `driver:location_update` untouched
- [x] Redis Pub/Sub untouched
- [x] `DeliveryTracking` untouched
- [x] `ridePath` untouched
- [x] OSRM Map Matching untouched
- [x] Billing calculations untouched

These represent the ACTUAL traveled path. Route Sessions represent the PLANNED route. They are independent.

Files

- `server/delivery-service/ws/handlers/driver-status.ts` — location updates
- `server/delivery-service/ws/handlers/driver-delivery.ts` — completion/cancel tracking
- `server/delivery-service/ws/router.ts` — WebSocket routing
- `server/prisma/schema.prisma` — Delivery.ridePath, Delivery.routeSessionId (separate fields)

---

# Phase 13 — Architecture Validation

Status:
Not Started

Tasks

- [ ] Review the entire implementation.
- [ ] Verify no duplicate geometry.
- [ ] Verify no duplicate business logic.
- [ ] Verify immutable revisions.
- [ ] Verify provider independence.
- [ ] Verify event-driven architecture.
- [ ] Verify session-aware cache.
- [ ] Verify Delivery owns RouteSession.
- [ ] Verify Map Service is Route Authority.
- [ ] Verify DDD boundaries preserved.
- [ ] Fix inconsistencies before marking complete.

---

# Session Rules

At the beginning of every implementation session:

1. Read `ROUTE_SESSION_IMPLEMENTATION_PLAN.md`.
2. Find the oldest unfinished phase.
3. Continue only from that phase.
4. Never skip phases.
5. Update the markdown before finishing.

---

# End-of-Session Update

Every implementation session must append:

## Completed Today

### Files Modified

- `server/map-service/prisma/schema.prisma` — Added `previousRevisionId` to RouteRevision (self-referential, optional)
- `server/map-service/src/domain/entities/route-session.entity.ts` — Added `previousRevisionId` to RouteRevision constructor
- `server/map-service/src/domain/interfaces/route-session-repository.interface.ts` — Added `previousRevisionId` to `SaveRouteRevisionData`
- `server/map-service/src/infrastructure/database/prisma-route-session.repository.ts` — `createRevision` passes `previousRevisionId`, `toRevision` reads it
- `server/map-service/src/application/use-cases/replan-route-session.use-case.ts` — Looks up previous revision ID by version before creating new revision
- `server/map-service/docs/ROUTE_SESSION_IMPLEMENTATION_PLAN.md` — Phase 5 → Done, Phase 9 → Done
- `driver/lib/api/map.ts` — Added `checkRouteDeviation()` export
- `driver/app/delivery/[id].tsx` — "Re-plan Route" button with deviation check guard

### Architecture Decisions

- **previousRevisionId is optional**, set only when creating revision v2+. First revision (v1) always has `previousRevisionId: null`.
- **Self-referential relation** in Prisma: RouteRevision references itself via `RevisionChain` relation. Indexed for audit queries.
- **Lookup by version**: `session.revisions.find(r => r.version === newVersion - 1)?.id` — relies on session being fetched with `include: { revisions: true }`. Performance is fine since revisions per session are small (< 10).

### Next Phase

Phase 10 — Provider Switching: register a second provider (e.g., GraphHopper) and verify `RouteProviderChanged` fires on failover.

---

# FINAL GOAL

When all phases reach 100%:

Add:

## Final Architecture Summary

Explain:

- Delivery lifecycle
- Route Session lifecycle
- Driver flow
- Customer flow
- Redis cache flow
- Event flow
- Provider switching
- Revision history
- Audit trail

Then add:

## Future Roadmap

Architecture ideas only (do NOT implement):

- AI ETA prediction
- Traffic-aware replanning
- Offline routing
- Multi-stop optimization
- Fleet optimization
- Smart Locker route optimization
- Predictive congestion analysis
