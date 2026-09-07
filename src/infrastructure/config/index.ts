import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function env(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  return v ? parseInt(v, 10) : fallback;
}

function envFloat(key: string, fallback: number): number {
  const v = process.env[key];
  return v ? parseFloat(v) : fallback;
}

export const config = {
  server: {
    port: envInt("PORT", 8084),
    nodeEnv: env("NODE_ENV", "development"),
  },

  database: {
    url: env("MAP_DATABASE_URL", ""),
    neonUrl: env("MAP_DATABASE_URL_UNPOOLED", ""),
  },

  redis: {
    url: env("MAP_REDIS_URL", "redis://localhost:6379/1"),
  },

  routeProvider: {
    primary: env("MAP_ROUTE_PROVIDER", "osrm"),
    fallback: env("MAP_ROUTE_PROVIDER_FALLBACK", "graphhopper"),
    osrm: {
      baseUrl: env("OSRM_BASE_URL", "http://localhost:5000"),
      timeoutMs: envInt("OSRM_TIMEOUT_MS", 5000),
      maxRoutePoints: envInt("OSRM_MAX_ROUTE_POINTS", 25),
    },
    graphhopper: {
      baseUrl: env("GRAPHHOPPER_BASE_URL", "https://graphhopper.com/api/1"),
      apiKey: env("GRAPHHOPPER_API_KEY", "default_key"),
      timeoutMs: envInt("GRAPHHOPPER_TIMEOUT_MS", 6000),
    },
  },

  geocodeProvider: {
    primary: env("MAP_GEOCODE_PROVIDER", "photon"),
    photon: {
      baseUrl: env("PHOTON_BASE_URL", "https://photon.komoot.io"),
      timeoutMs: envInt("PHOTON_TIMEOUT_MS", 3000),
    },
    nominatim: {
      baseUrl: env("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org"),
    },
  },

  cache: {
    ttl: {
      route: envInt("MAP_CACHE_TTL_ROUTE", 3600),
      autocomplete: envInt("MAP_CACHE_TTL_AUTOCOMPLETE", 1800),
      reverse: envInt("MAP_CACHE_TTL_REVERSE", 86400),
      nearby: envInt("MAP_CACHE_TTL_NEARBY", 900),
      recommendation: envInt("MAP_CACHE_TTL_RECOMMENDATION", 604800),
    },
  },

  search: {
    rankingStrategy: env("SEARCH_RANKING_STRATEGY", "hybrid"),
    minQueryLength: envInt("AUTOCOMPLETE_MIN_QUERY_LENGTH", 2),
    defaultLimit: envInt("AUTOCOMPLETE_DEFAULT_LIMIT", 8),
    maxLimit: envInt("AUTOCOMPLETE_MAX_LIMIT", 25),
    confidenceThreshold: envFloat("AUTOCOMPLETE_CONFIDENCE_THRESHOLD", 0.85),
    reverseRadius: envInt("REVERSE_GEOCODE_DEFAULT_RADIUS", 50),
  },

  import: {
    batchSize: envInt("IMPORT_BATCH_SIZE", 100),
    maxConcurrency: envInt("IMPORT_MAX_CONCURRENCY", 3),
  },
};
