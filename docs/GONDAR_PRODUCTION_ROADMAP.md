# Gondar City Map & Routing Engine — Production Implementation Roadmap & Tracker

**Target Region**: Gondar Metropolitan Area, Amhara, Ethiopia  
**Bounding Box (BBox)**: `[37.38°E, 12.48°N]` to `[37.56°E, 12.68°N]`  
**Target Fleet**: Bajaj (Three-wheelers), Motorbikes, Minibuses, Pedestrian Couriers  
**Target SLA**: $< 50\text{ ms}$ route calculation, $\pm 10\%$ real-world ETA accuracy, zero upstream IP bans

---

## 1. System Architecture & Component Mapping

```mermaid
flowchart TD
    Client["Client (Driver / Customer App)"] --> CDN["Cloudflare CDN / Reverse Proxy"]
    CDN --> RateLimiter["Rate Limiter & Auth Guard"]

    subgraph MapService ["PackMan Map Service (Port 8084)"]
        RateLimiter --> RouteController["Route & Session Controllers"]
        RateLimiter --> TileController["Tile Controller (Cached/PMTiles)"]

        RouteController --> PlanRouteUseCase["PlanRouteUseCase"]
        PlanRouteUseCase --> RouteRegistry["RouteProviderRegistry"]
        RouteRegistry --> OSRM["Local OSRM Engine (Gondar BBox)"]

        OSRM --> EtaEnhancer["GondarEtaEnhancer"]
        EtaEnhancer --> Incline["Incline & Slope Penalty"]
        EtaEnhancer --> Surface["Surface Calibration (Cobblestone/Dirt)"]
        EtaEnhancer --> Congestion["Market Day / Temporal Congestion"]
        EtaEnhancer --> Doorstep["Doorstep & Handover Buffer (+4 min)"]

        PlanRouteUseCase --> RedisCache["Redis Route Cache (1h TTL)"]
        PlanRouteUseCase --> Postgres["Postgres (RouteSession + Audit)"]
    end
```

---

## 2. Implementation Tracker

### Phase 1: Gondar Map Extraction & Custom OSRM Engine (Days 1–2)

_Goal: Fast sub-second graph loads, zero country-wide bloat, and custom vehicle physics._

| Task ID  | Task Description                          | Target File(s)                   |   Owner   |    Status     | Acceptance Criteria                                                                                                    |
| -------- | ----------------------------------------- | -------------------------------- | :-------: | :-----------: | ---------------------------------------------------------------------------------------------------------------------- |
| **P1.1** | Create Gondar BBox extraction script      | `scripts/crop-gondar.sh`         |  Backend  | `[ ] Pending` | Extracts `gondar-latest.osm.pbf` ($< 5\text{ MB}$) from Geofabrik Ethiopia dump using `osmium-tool`.                   |
| **P1.2** | Write `bajaj.lua` custom OSRM profile     | `docker/profiles/bajaj.lua`      | Infra/Map | `[ ] Pending` | Max speed clamped to 32 km/h; surface penalty applied for cobblestone (18 km/h) & unpaved (12 km/h); prohibits stairs. |
| **P1.3** | Calibrate `car.lua` surface speeds        | `docker/profiles/car.lua`        | Infra/Map | `[ ] Pending` | Incorporates `surface=sett`, `surface=cobblestone`, and `surface=unpaved` realistic speeds.                            |
| **P1.4** | Refactor Docker startup & volume mounting | `Dockerfile`, `scripts/start.sh` |  DevOps   | `[ ] Pending` | Container boots in $< 5\text{ seconds}$ by loading pre-compiled graph data; no on-boot 15-min compilation.             |

---

### Phase 2: Route Planning & Gondar ETA Calculation Engine (Days 3–4)

_Goal: Deliver accurate, topography-aware ETAs that reflect real courier journeys in Gondar._

| Task ID  | Task Description                                   | Target File(s)                                                                                |  Owner   |    Status     | Acceptance Criteria                                                                                         |
| -------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- | :------: | :-----------: | ----------------------------------------------------------------------------------------------------------- |
| **P2.1** | Add `BAJAJ` profile to Domain & Value Objects      | `src/domain/value-objects/profile.vo.ts`, `src/domain/interfaces/route-provider.interface.ts` | Backend  | `[ ] Pending` | `RouteProfile.BAJAJ` is a first-class profile across controllers, DTOs, and providers.                      |
| **P2.2** | Build `GondarEtaEnhancer` service                  | `src/domain/services/routing/gondar-eta-enhancer.ts`                                          | Core Dev | `[ ] Pending` | Post-processes raw OSRM durations by applying slope, surface, and buffer adjustments.                       |
| **P2.3** | Implement Incline & Topography Penalties           | `src/infrastructure/providers/route/mappers/osrm-route.mapper.ts`                             | Core Dev | `[ ] Pending` | Uphill segments $> 8\%$ grade penalized by $1.4\times$ to $2.0\times$; downgrades extreme climbs for Bajaj. |
| **P2.4** | Add Doorstep & Handover Buffer                     | `src/application/use-cases/plan-route.use-case.ts`                                            | Core Dev | `[ ] Pending` | Configurable +240s buffer added to delivery destination ETAs to account for address finding & calls.        |
| **P2.5** | Add Temporal Congestion (Piassa & Saturday Market) | `src/domain/services/routing/congestion-zones.ts`                                             | Core Dev | `[ ] Pending` | Polygons for Piassa/Arada apply dynamic speed dampening during rush hours & Saturday market times.          |
| **P2.6** | Calibrate Emergency Fallback Provider              | `src/infrastructure/providers/route/emergency-fallback.provider.ts`                           | Core Dev | `[ ] Pending` | Detour tortuosity updated to $1.38\times$; fallback speeds calibrated for Gondar Bajaj and motorcycle.      |

---

### Phase 3: Production Security, Rate Limiting & Auth (Day 5)

_Goal: Prevent open proxy abuse, denial-of-service, and unauthorized data mutations._

| Task ID  | Task Description                               | Target File(s)                                                |  Owner  |    Status     | Acceptance Criteria                                                                                |
| -------- | ---------------------------------------------- | ------------------------------------------------------------- | :-----: | :-----------: | -------------------------------------------------------------------------------------------------- |
| **P3.1** | Install & configure Express/Redis rate limiter | `src/presentation/middleware/rate-limiter.ts`, `src/index.ts` | Backend | `[ ] Pending` | 60 req/min for route planning, 600 req/min for tiles, 10 req/min for write endpoints per IP.       |
| **P3.2** | Restrict CORS to authorized origins            | `src/index.ts`, `src/infrastructure/config/index.ts`          | Backend | `[ ] Pending` | Whitelisted origins only (mobile apps, management dashboard); blocks arbitrary web scraping.       |
| **P3.3** | Secure administrative and ingestion endpoints  | `src/presentation/middleware/auth-guard.ts`                   | Backend | `[ ] Pending` | `/api/v1/map/scraper/run`, `/location-ingest`, `/enrichment` require valid internal service token. |

---

### Phase 4: Cartography & Tile Infrastructure (Days 6–7)

_Goal: Zero legal risk, zero third-party IP bans, fast map rendering._

| Task ID  | Task Description                                     | Target File(s)                                                                 |   Owner   |    Status     | Acceptance Criteria                                                                                  |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | :-------: | :-----------: | ---------------------------------------------------------------------------------------------------- |
| **P4.1** | Implement Tile Cache Layer                           | `src/presentation/controllers/tile.controller.ts`                              |  Backend  | `[ ] Pending` | Remote raster tiles cached to local disk / Redis with 30-day TTL; upstream fetch only on cache miss. |
| **P4.2** | Add Cloudflare / Edge CDN headers                    | `src/presentation/controllers/tile.controller.ts`                              |   Infra   | `[ ] Pending` | `Cache-Control: public, max-age=2592000, immutable` headers sent with all tile responses.            |
| **P4.3** | [Optional/Recommended] Evaluate PMTiles vector tiles | `data/tiles/gondar.pmtiles`, `src/presentation/controllers/tile.controller.ts` | Map/Infra | `[ ] Pending` | Serverless vector tile serving for Gondar using Protomaps PMTiles on S3/R2.                          |

---

### Phase 5: Automated Testing & Ground-Truth Calibration (Days 7–8)

_Goal: 100% verified route calculations, zero regressions, and tested against real Gondar roads._

| Task ID  | Task Description                          | Target File(s)                                                | Owner  |    Status     | Acceptance Criteria                                                                         |
| -------- | ----------------------------------------- | ------------------------------------------------------------- | :----: | :-----------: | ------------------------------------------------------------------------------------------- |
| **P5.1** | Setup Vitest / Jest test runner           | `package.json`, `tsconfig.json`, `vitest.config.ts`           | QA/Dev | `[ ] Pending` | `npm test` runs comprehensive unit and integration test suites.                             |
| **P5.2** | Unit tests for Gondar ETA and Bajaj logic | `tests/unit/gondar-eta.spec.ts`, `tests/unit/profile.spec.ts` | QA/Dev | `[ ] Pending` | Validates cobblestone slowdowns, hill grade factors, and doorstep buffer math.              |
| **P5.3** | Integration tests for Route API           | `tests/integration/route-api.spec.ts`                         | QA/Dev | `[ ] Pending` | End-to-end tests for `/api/v1/map/route` and session creation with real Gondar coordinates. |
| **P5.4** | Benchmark Ground-Truth Corridors          | `tests/benchmark/corridors.json`                              | QA/Dev | `[ ] Pending` | ETA error margin $< 10\%$ against 5 real driver benchmark routes.                           |

---

### Phase 6: Deployment, Load Testing & Monitoring (Days 9–10)

_Goal: Smooth deployment, verified throughput under load, and live operational visibility._

| Task ID  | Task Description                             | Target File(s)                                      | Owner  |    Status     | Acceptance Criteria                                                                                |
| -------- | -------------------------------------------- | --------------------------------------------------- | :----: | :-----------: | -------------------------------------------------------------------------------------------------- |
| **P6.1** | Run load testing (k6 / autocannon)           | `scripts/load-test.js`                              | DevOps | `[ ] Pending` | Sustains $\ge 150\text{ req/sec}$ with $p95 < 80\text{ ms}$ under concurrent routing requests.     |
| **P6.2** | Health check & OSRM probe verification       | `src/presentation/controllers/health.controller.ts` | DevOps | `[ ] Pending` | `/health` accurately monitors Postgres, Redis, and local OSRM process health.                      |
| **P6.3** | Production Deployment & Volume Configuration | `docker-compose.prod.yml`, deployment docs          | DevOps | `[ ] Pending` | Container boots cleanly in production with persistent volume for OSRM graph and Redis persistence. |

---

## 3. Ground-Truth Calibration Corridors in Gondar

Use these 5 real-world corridors for QA and ETA tuning:

```
[Corridor 1: Airport Highway]
Azezo Airport (12.5292, 37.4325) ──(Asphalt, ~35-45 km/h)──> Fasil Ghebbi / Piassa (12.6078, 37.4697)
Distance: ~11.8 km | Expected Bajaj ETA: ~22-26 min | Expected Car ETA: ~18-21 min

[Corridor 2: Hilly Urban Connector]
Piassa Roundabout (12.6078, 37.4697) ──(Hills, ~20-30 km/h)──> Maraki Campus (12.6045, 37.4892)
Distance: ~2.4 km | Expected Bajaj ETA: ~7-9 min (with hill penalty)

[Corridor 3: Cobblestone Residential]
Arada Post Office (12.6105, 37.4650) ──(Cobblestones, ~12-18 km/h)──> Kebele 18 Inner (12.6180, 37.4580)
Distance: ~1.6 km | Expected Bajaj ETA: ~6-8 min | Expected Car ETA: ~7-9 min

[Corridor 4: Steep Hill Incline]
Posta Bet (12.6080, 37.4680) ──(Steep Incline >12%, ~10-15 km/h)──> Goha Hotel Hill (12.6145, 37.4815)
Distance: ~2.1 km | Expected Bajaj ETA: ~9-11 min | Incline Multiplier: 1.6x

[Corridor 5: Saturday Market Bottleneck]
Shint Bet / Checheho (12.6010, 37.4620) ──(Congestion Zone)──> Arada Market (12.6110, 37.4660)
Distance: ~1.4 km | Normal ETA: ~4 min | Saturday Peak Market ETA: ~10-14 min (2.5x multiplier)
```

---

## 4. Key Configuration Schema for Gondar (`.env.production`)

```properties
# Server & Environment
NODE_ENV=production
PORT=8084
MAP_REGION=gondar

# Database & Cache
MAP_DATABASE_URL=postgresql://packman_user:secret@postgres:5432/packman_maps?schema=public
MAP_REDIS_URL=redis://redis:6379/1

# OSRM Local Instance (Gondar Cropped Graph)
MAP_ROUTE_PROVIDER=osrm
OSRM_BASE_URL=http://127.0.0.1:5000
OSRM_TIMEOUT_MS=2500
OSRM_MAX_ROUTE_POINTS=25

# Gondar ETA Calibration Parameters
GONDAR_DOORSTEP_BUFFER_SECONDS=240
GONDAR_INCLINE_PENALTY_ENABLED=true
GONDAR_SATURDAY_MARKET_FACTOR=2.0

# Rate Limiting
RATE_LIMIT_ROUTE_WINDOW_MS=60000
RATE_LIMIT_ROUTE_MAX=60
RATE_LIMIT_TILES_MAX=600

# Security
MAP_SERVICE_KEY=your-secure-internal-secret-key
ALLOWED_CORS_ORIGINS=https://app.packman.et,https://driver.packman.et
```
