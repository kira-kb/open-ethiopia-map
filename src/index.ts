import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./infrastructure/config";
import { StructuredLogger } from "./infrastructure/logging/structured.logger";
import { NoopMetricsRegistry } from "./infrastructure/metrics/noop.metrics";
import { InMemoryEventBus } from "./infrastructure/queue/in-memory.event-bus";
import { RedisCache } from "./infrastructure/cache/redis.cache";
import { RecommendationCache } from "./infrastructure/cache/recommendation.cache";
import { PrismaPlaceRepository } from "./infrastructure/database/prisma-place.repository";
import { PrismaLocationEnrichmentRepository } from "./infrastructure/database/prisma-enrichment.repository";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../node_modules/.prisma/map-client";
import { OsrmRouteProvider } from "./infrastructure/providers/route/osrm.provider";
import { GraphHopperRouteProvider } from "./infrastructure/providers/route/graphhopper.provider";
import { PhotonGeocodeProvider } from "./infrastructure/providers/geocode/photon.provider";
import { RouteProviderRegistry } from "./infrastructure/providers/registry/route-provider.registry";
import { GeocodeProviderRegistry } from "./infrastructure/providers/registry/geocode-provider.registry";

import { PlanRouteUseCase } from "./application/use-cases/plan-route.use-case";
import { SearchPlacesUseCase, SearchPipeline } from "./application/use-cases";
import { ReverseGeocodeUseCase } from "./application/use-cases/reverse-geocode.use-case";
import { NearbySearchUseCase } from "./application/use-cases/nearby-search.use-case";
import { SavedPlacesSource, PackManLocationsSource, RecommendationSource, ProviderSource } from "./infrastructure/search-sources";

import { RecommendationEngine } from "./domain/services/recommendation";

import { RouteController } from "./presentation/controllers/route.controller";
import { AutocompleteController } from "./presentation/controllers/autocomplete.controller";
import { ReverseGeocodeController } from "./presentation/controllers/reverse-geocode.controller";
import { NearbyController } from "./presentation/controllers/nearby.controller";
import { HealthController } from "./presentation/controllers/health.controller";
import { EnrichmentController, SavedPlacesController, RouteSessionController, LocationIngestController, TileController } from "./presentation/controllers";
import { createRouter } from "./presentation/router";
import { createErrorHandler } from "./presentation/middleware/error-handler";
import { createRequestLogger } from "./presentation/middleware/request-logger";

import { PlaceImportWorker, CacheWarmWorker, ConfidenceWorker, RedisEventBridge } from "./infrastructure/workers";
import { PrismaLocationConfidenceRepository } from "./infrastructure/database/prisma-confidence.repository";
import { PrismaRouteSessionRepository } from "./infrastructure/database/prisma-route-session.repository";
import { SessionCache } from "./infrastructure/cache/session.cache";
import { CreateRouteSessionUseCase, GetRouteSessionUseCase, ReplanRouteSessionUseCase, GetRouteHistoryUseCase, CloseRouteSessionUseCase, CheckDeviationUseCase } from "./application/use-cases";

async function main(): Promise<void> {
  const logger = new StructuredLogger("map-service", config.server.nodeEnv === "development" ? "debug" : "info");
  const metrics = new NoopMetricsRegistry();
  const eventBus = new InMemoryEventBus(logger);

  logger.info("Starting PackMan Map Service", { version: "1.0.0", port: config.server.port });

  // ── Infrastructure ────────────────────────────────────────────
  const cache = new RedisCache(logger);
  try {
    await cache.connect();
    logger.info("Connected to Redis");
  } catch (err) {
    logger.warn("Redis unavailable, running without cache", { error: (err as Error).message });
  }

  const placeRepo = new PrismaPlaceRepository(logger);
  logger.info("PostgreSQL repository initialized");

  // ── Recommendation Engine ─────────────────────────────────────
  const recommendationEngine = new RecommendationEngine();
  const recommendationCache = new RecommendationCache(cache, logger);
  logger.info("Recommendation engine initialized");

  // ── Providers ─────────────────────────────────────────────────
  const osrmProvider = new OsrmRouteProvider();
  const graphhopperProvider = new GraphHopperRouteProvider();
  const routeRegistry = new RouteProviderRegistry(logger, metrics, eventBus);
  routeRegistry.register(osrmProvider);
  routeRegistry.register(graphhopperProvider);

  const photonProvider = new PhotonGeocodeProvider();
  const geocodeRegistry = new GeocodeProviderRegistry(logger);
  geocodeRegistry.register(photonProvider);

  // ── Search Pipeline ─────────────────────────────────────────
  const searchSources = [
    new SavedPlacesSource(placeRepo, logger),
    new PackManLocationsSource(placeRepo, logger),
    new RecommendationSource(recommendationCache, logger),
    new ProviderSource(geocodeRegistry, logger),
  ];
  const pipeline = new SearchPipeline(searchSources, cache, logger);

  // ── Application ──────────────────────────────────────────────
  const planRoute = new PlanRouteUseCase(routeRegistry, cache, logger, metrics, eventBus);
  const searchPlaces = new SearchPlacesUseCase(pipeline, logger, metrics, eventBus);
  const reverseGeocode = new ReverseGeocodeUseCase(placeRepo, geocodeRegistry, cache, logger, metrics, eventBus);
  const nearbySearch = new NearbySearchUseCase(placeRepo, cache, logger);

  // ── Route Session ──────────────────────────────────────────────
  const routeSessionPrisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: config.database.url }),
  });
  const routeSessionRepo = new PrismaRouteSessionRepository(routeSessionPrisma);
  const sessionCache = new SessionCache(cache);
  const createRouteSession = new CreateRouteSessionUseCase(
    routeSessionRepo, planRoute, cache, sessionCache, logger, metrics, eventBus,
  );
  const getRouteSession = new GetRouteSessionUseCase(routeSessionRepo, sessionCache, logger);
  const replanRouteSession = new ReplanRouteSessionUseCase(routeSessionRepo, planRoute, sessionCache, logger, eventBus);
  const closeRouteSession = new CloseRouteSessionUseCase(routeSessionRepo, sessionCache, eventBus);
  const checkDeviation = new CheckDeviationUseCase(routeSessionRepo, logger);
  const getRouteHistory = new GetRouteHistoryUseCase(routeSessionRepo);
  const routeSessionController = new RouteSessionController(
    createRouteSession, getRouteSession, replanRouteSession, getRouteHistory, closeRouteSession, checkDeviation,
  );

  // ── Workers ───────────────────────────────────────────────────
  const placeImportWorker = new PlaceImportWorker(placeRepo, logger);
  const cacheWarmWorker = new CacheWarmWorker(cache, logger);

  eventBus.subscribe("PlaceImported", (event) => placeImportWorker.handle(event));
  eventBus.subscribe("SearchPerformed", (event) => cacheWarmWorker.handle(event));

  // ── Confidence & Redis Event Bridge ───────────────────────────
  const confidenceRepo = new PrismaLocationConfidenceRepository(logger);
  const confidenceWorker = new ConfidenceWorker(confidenceRepo, logger);
  eventBus.subscribe("DeliveryCompleted", (event) => confidenceWorker.handleDeliveryCompleted(event as any));
  eventBus.subscribe("DeliveryAddressCorrected", (event) => confidenceWorker.handleAddressCorrected(event as any));
  eventBus.subscribe("DeliveryFailedLocation", (event) => confidenceWorker.handleDeliveryFailedLocation(event as any));
  eventBus.subscribe("DeliveryDriverRequestedHelp", (event) => confidenceWorker.handleDriverRequestedHelp(event as any));

  const redisEventBridge = new RedisEventBridge(
    createRouteSession,
    closeRouteSession,
    confidenceWorker,
    eventBus,
    logger,
  );
  redisEventBridge.start();

  // ── Presentation ──────────────────────────────────────────────
  const routeController = new RouteController(planRoute);
  const autocompleteController = new AutocompleteController(searchPlaces);
  const reverseGeocodeController = new ReverseGeocodeController(reverseGeocode);
  const nearbyController = new NearbyController(nearbySearch);
  const healthController = new HealthController(routeRegistry);
  // ── Location Enrichment ────────────────────────────────────────
  const enrichmentRepo = new PrismaLocationEnrichmentRepository(logger);

  const invalidateUserCache = (userId: string) => searchPlaces.invalidateUserCache(userId);

  const enrichmentController = new EnrichmentController(placeRepo, enrichmentRepo, recommendationCache, eventBus, logger, invalidateUserCache);
  const savedPlacesController = new SavedPlacesController(placeRepo, logger, invalidateUserCache);
  const locationIngestController = new LocationIngestController(logger, recommendationCache);
  const tileController = new TileController(logger);

  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(createRequestLogger(logger));

  const router = createRouter(
    routeController,
    autocompleteController,
    reverseGeocodeController,
    nearbyController,
    healthController,
    enrichmentController,
    savedPlacesController,
    routeSessionController,
    locationIngestController,
    tileController,
  );
  app.use(router);
  app.use(createErrorHandler(logger));

  app.listen(config.server.port, () => {
    logger.info(`Map service listening on port ${config.server.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start map service:", err);
  process.exit(1);
});
