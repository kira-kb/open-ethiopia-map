import { Router } from "express";
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
import { renderDocsHtml } from "./views/docs.page";

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
): Router {
  const router = Router();

  router.get("/", (req, res) => {
    if (req.headers.accept && req.headers.accept.includes("application/json") && !req.headers.accept.includes("text/html")) {
      res.json({
        name: "Open Ethiopia Map & Routing Platform",
        version: "1.0.0",
        status: "operational",
        docs: {
          health: "/health",
          autocomplete: "/api/v1/map/autocomplete?q={query}",
          reverseGeocode: "/api/v1/map/reverse-geocode?lat={latitude}&lng={longitude}",
          nearby: "/api/v1/map/nearby?lat={latitude}&lng={longitude}&radius={meters}",
          route: "POST /api/v1/map/route",
          tiles: "/api/v1/map/tiles/{style}/{z}/{x}/{y}.png (styles: dark, light, voyager, osm)",
          savedPlaces: "/api/v1/map/saved-places",
        },
      });
      return;
    }
    res.type("html").send(renderDocsHtml());
  });

  router.post("/api/v1/map/route", routeController.plan.bind(routeController));
  router.get("/api/v1/map/autocomplete", autocompleteController.search.bind(autocompleteController));
  router.get("/api/v1/map/reverse-geocode", reverseGeocodeController.lookup.bind(reverseGeocodeController));
  router.get("/api/v1/map/nearby", nearbyController.search.bind(nearbyController));
  router.get("/health", healthController.check.bind(healthController));

  if (tileController) {
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

  return router;
}
