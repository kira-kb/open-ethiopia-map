import { Router, RequestHandler } from "express";
import { RouteController } from "./controllers/route.controller";
import { AutocompleteController } from "./controllers/autocomplete.controller";
import { ReverseGeocodeController } from "./controllers/reverse-geocode.controller";
import { NearbyController } from "./controllers/nearby.controller";
import { HealthController } from "./controllers/health.controller";
import { EnrichmentController } from "./controllers/enrichment.controller";
import { SavedPlacesController } from "./controllers/saved-places.controller";
import { RouteSessionController } from "./controllers/route-session.controller";
import { LocationIngestController } from "./controllers/location-ingest.controller";
import { TileController } from "./controllers/tile.controller";
import { ScraperController } from "./controllers/scraper.controller";
import { TelemetryController } from "./controllers/telemetry.controller";
import { MapMatchController } from "./controllers/map-match.controller";
import { AdminPortalController } from "./controllers/admin-portal.controller";
import { MatrixController } from "./controllers/matrix.controller";

export function createRouter(
  routeController: RouteController,
  autocompleteController: AutocompleteController,
  reverseGeocodeController: ReverseGeocodeController,
  nearbyController: NearbyController,
  healthController: HealthController,
  enrichmentController?: EnrichmentController,
  savedPlacesController?: SavedPlacesController,
  routeSessionController?: RouteSessionController,
  locationIngestController?: LocationIngestController,
  tileController?: TileController,
  scraperController?: ScraperController,
  telemetryController?: TelemetryController,
  mapMatchController?: MapMatchController,
  matrixController?: MatrixController,
  adminPortalController?: AdminPortalController,
  apiKeyAuthMiddleware?: RequestHandler,
  adminAuthMiddleware?: RequestHandler,
): Router {
  const router = Router();

  // ── Open Portal & Public Info Routes ──────────────────────────
  router.get("/", (req, res) => {
    res.json({
      name: "Open Ethiopia Map & Routing Platform",
      version: "1.0.0",
      status: "operational",
      description: "Canonical routing, geospatial intelligence, and MapLibre tile authority for Ethiopia.",
      portal: "GET /portal",
      documentation: "https://open-ethiopia-map.vercel.app/docs",
      endpoints: {
        health: "GET /health",
        portal: "GET /portal",
        adminLogin: "POST /api/v1/admin/auth/login",
        route: "POST /api/v1/map/route",
        matrix: "POST /api/v1/map/matrix",
        autocomplete: "GET /api/v1/map/autocomplete?q={query}&limit={limit}",
        reverseGeocode: "GET /api/v1/map/reverse-geocode?lat={latitude}&lng={longitude}",
        nearby: "GET /api/v1/map/nearby?lat={latitude}&lng={longitude}&radius={meters}",
        styles: "GET /api/v1/map/styles/:style.json (dark, light, voyager, osm, topo)",
        tiles: "GET /api/v1/map/tiles/:style/:z/:x/:y.png",
        vectorTiles: "GET /api/v1/map/tiles/vector/:z/:x/:y.pbf",
        routeSessions: {
          create: "POST /api/v1/map/routes/create",
          get: "GET /api/v1/map/routes/session/:id",
          replan: "POST /api/v1/map/routes/session/:id/replan",
          close: "POST /api/v1/map/routes/session/:id/close",
          checkDeviation: "POST /api/v1/map/routes/session/:id/check-deviation",
          history: "GET /api/v1/map/routes/session/:id/history",
        },
        traffic: {
          telemetry: "POST /api/v1/map/traffic/telemetry",
          mapMatch: "POST /api/v1/map/match",
        },
        savedPlaces: "GET, POST, PUT, DELETE /api/v1/map/saved-places",
        enrichment: "POST /api/v1/map/location-enrichment",
        scrapers: {
          list: "GET /api/v1/map/scrapers",
          run: "POST /api/v1/map/scrapers/run",
          status: "GET /api/v1/map/scrapers/status",
        },
      },
    });
  });

  router.get("/health", healthController.check.bind(healthController));

  // ── Admin Web Portal & Management APIs ────────────────────────
  if (adminPortalController) {
    router.get("/portal", adminPortalController.servePortalPage.bind(adminPortalController));
    router.get("/portal/login", adminPortalController.servePortalPage.bind(adminPortalController));
    router.post("/api/v1/admin/auth/login", adminPortalController.login.bind(adminPortalController));

    const adminGuard: RequestHandler[] = adminAuthMiddleware ? [adminAuthMiddleware] : [];
    router.get("/api/v1/admin/auth/me", ...adminGuard, adminPortalController.getMe.bind(adminPortalController));
    router.get("/api/v1/admin/api-keys", ...adminGuard, adminPortalController.listKeys.bind(adminPortalController));
    router.post("/api/v1/admin/api-keys", ...adminGuard, adminPortalController.createKey.bind(adminPortalController));
    router.put("/api/v1/admin/api-keys/:id", ...adminGuard, adminPortalController.updateKey.bind(adminPortalController));
    router.delete("/api/v1/admin/api-keys/:id", ...adminGuard, adminPortalController.deleteKey.bind(adminPortalController));
  }

  // ── API Key Protected Spatial Endpoints ───────────────────────
  if (apiKeyAuthMiddleware) {
    router.use("/api/v1/map", apiKeyAuthMiddleware);
  }

  router.post("/api/v1/map/route", routeController.plan.bind(routeController));
  router.get("/api/v1/map/autocomplete", autocompleteController.search.bind(autocompleteController));
  router.get("/api/v1/map/reverse-geocode", reverseGeocodeController.lookup.bind(reverseGeocodeController));
  router.get("/api/v1/map/nearby", nearbyController.search.bind(nearbyController));

  if (tileController) {
    router.get("/api/v1/map/styles/:style.json", tileController.serveStyle.bind(tileController));
    router.get("/api/v1/map/styles/:style", tileController.serveStyle.bind(tileController));
    router.get("/api/v1/map/tiles/vector/:z/:x/:y.mvt", tileController.serveVector.bind(tileController));
    router.get("/api/v1/map/tiles/vector/:z/:x/:y.pbf", tileController.serveVector.bind(tileController));
    router.get("/api/v1/map/tiles/vector/:z/:x/:y", tileController.serveVector.bind(tileController));
    router.get("/api/v1/map/tiles/:style/:z/:x/:y.png", tileController.serve.bind(tileController));
    router.get("/api/v1/map/tiles/:style/:z/:x/:y", tileController.serve.bind(tileController));
    router.get("/api/v1/map/tiles/:z/:x/:y.png", tileController.serve.bind(tileController));
    router.get("/api/v1/map/tiles/:z/:x/:y", tileController.serve.bind(tileController));
  }

  if (locationIngestController) {
    router.post("/api/v1/map/locations/ingest", locationIngestController.ingest.bind(locationIngestController));
    router.post("/api/v1/map/places/ingest", locationIngestController.ingest.bind(locationIngestController));
  }

  if (enrichmentController) {
    router.post("/api/v1/map/location-enrichment", enrichmentController.save.bind(enrichmentController));
  }

  if (savedPlacesController) {
    router.post("/api/v1/map/saved-places", savedPlacesController.create.bind(savedPlacesController));
    router.get("/api/v1/map/saved-places", savedPlacesController.list.bind(savedPlacesController));
    router.put("/api/v1/map/saved-places/:id", savedPlacesController.update.bind(savedPlacesController));
    router.delete("/api/v1/map/saved-places/:id", savedPlacesController.delete.bind(savedPlacesController));
  }

  if (routeSessionController) {
    router.post("/api/v1/map/routes/create", routeSessionController.create.bind(routeSessionController));
    router.get("/api/v1/map/routes/session/:id", routeSessionController.get.bind(routeSessionController));
    router.get("/api/v1/map/routes/delivery/:deliveryId", routeSessionController.getByDelivery.bind(routeSessionController));
    router.post("/api/v1/map/routes/session/:id/replan", routeSessionController.replan.bind(routeSessionController));
    router.post("/api/v1/map/routes/session/:id/close", routeSessionController.close.bind(routeSessionController));
    router.post("/api/v1/map/routes/session/:id/check-deviation", routeSessionController.checkDeviation.bind(routeSessionController));
    router.get("/api/v1/map/routes/session/:id/history", routeSessionController.getHistory.bind(routeSessionController));
  }

  if (scraperController) {
    router.get("/api/v1/map/scrapers", scraperController.list.bind(scraperController));
    router.post("/api/v1/map/scrapers/run", scraperController.run.bind(scraperController));
    router.get("/api/v1/map/scrapers/status", scraperController.status.bind(scraperController));
  }

  if (telemetryController) {
    router.post("/api/v1/map/traffic/telemetry", telemetryController.ingest.bind(telemetryController));
  }

  if (mapMatchController) {
    router.post("/api/v1/map/match", mapMatchController.match.bind(mapMatchController));
  }

  if (matrixController) {
    router.post("/api/v1/map/matrix", matrixController.compute.bind(matrixController));
  }

  return router;
}
