import { Request, Response, NextFunction } from "express";
import { ApiKeyStore } from "../../infrastructure/database/api-key.store";
import { AdminAuthService } from "../../application/services/admin-auth.service";
import { Logger } from "../../domain/interfaces";

export interface AuthenticatedRequest extends Request {
  apiKey?: any;
  project?: {
    id: string;
    name: string;
    role: string;
  };
  adminUser?: {
    email: string;
    role: string;
  };
}

export function createApiKeyAuthMiddleware(apiKeyStore: ApiKeyStore, logger?: Logger) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1. Whitelist open public routes: root, health, admin portal, playground, and map tiles/styles/fonts (100% free, unmetered)
    const path = req.path;
    const origUrl = req.originalUrl || req.url || "";
    if (
      path === "/" ||
      path === "/health" ||
      path.startsWith("/health") ||
      origUrl.includes("/health") ||
      path.startsWith("/portal") ||
      path.startsWith("/playground") ||
      path.startsWith("/api/v1/admin") ||
      path.startsWith("/styles") ||
      path.startsWith("/tiles") ||
      path.startsWith("/fonts") ||
      origUrl.includes("/styles") ||
      origUrl.includes("/tiles") ||
      origUrl.includes("/fonts")
    ) {
      next();
      return;
    }

    // 2. Extract API Key
    let key: string | undefined;

    // Check header X-API-Key
    const xApiKey = req.headers["x-api-key"];
    if (typeof xApiKey === "string" && xApiKey.trim()) {
      key = xApiKey.trim();
    }

    // Check Authorization: Bearer <key>
    if (!key && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        key = authHeader.substring(7).trim();
      }
    }

    // Check query parameter ?key=... or ?apiKey=...
    if (!key && req.query) {
      if (typeof req.query.key === "string" && req.query.key.trim()) {
        key = req.query.key.trim();
      } else if (typeof req.query.apiKey === "string" && req.query.apiKey.trim()) {
        key = req.query.apiKey.trim();
      }
    }

    // Optional bypass: assign default key when API keys are not enforced in self-hosted mode
    if (!key && (process.env.MAP_REQUIRE_API_KEY === "false" || process.env.REQUIRE_API_KEY === "false")) {
      key = "sk_delivery_live_gondar_3b1c559812a4";
    }

    // If missing key
    if (!key) {
      logger?.warn("Unauthorized API call attempt - missing key", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing API key. Provide via 'X-API-Key' header or '?key=' query parameter.",
        documentation: "https://open-ethiopia-map.vercel.app/docs#authentication",
      });
      return;
    }

    // 3. Find and validate key
    const apiKey = await apiKeyStore.findByKey(key);
    if (!apiKey || !apiKey.isActive) {
      logger?.warn("Unauthorized API call attempt - invalid or disabled key", {
        path: req.path,
        key: key.substring(0, 8) + "...",
      });
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or deactivated API key. Please check your credentials in the Developer Portal.",
      });
      return;
    }

    // 4. Role & Scope Permissions Check
    if (!apiKey.canAccessPath(req.path, req.method)) {
      logger?.warn("Forbidden API access attempt", {
        path: req.path,
        method: req.method,
        keyRole: apiKey.role,
        keyName: apiKey.name,
      });
      res.status(403).json({
        error: "Forbidden",
        message: `API key with role '${apiKey.role}' is not authorized to access ${req.method} ${req.path}. Public keys (pk_live_...) are restricted to tiles and search; use a service key (sk_live_...) for routing, sessions, or telemetry.`,
      });
      return;
    }

    // 5. Origin validation for browser public keys (if origins are specified)
    if (apiKey.isPublicKey() && apiKey.allowedOrigins && !apiKey.allowedOrigins.includes("*")) {
      const origin = req.headers.origin || req.headers.referer;
      if (origin) {
        const isAllowed = apiKey.allowedOrigins.some((allowed) => origin.includes(allowed));
        if (!isAllowed) {
          res.status(403).json({
            error: "Forbidden",
            message: `Request origin '${origin}' is not authorized for this API key.`,
          });
          return;
        }
      }
    }

    // 6. Record usage asynchronously
    apiKeyStore.recordUsage(apiKey.id).catch(() => {});

    // Attach to request
    req.apiKey = apiKey;
    req.project = {
      id: apiKey.id,
      name: apiKey.name,
      role: apiKey.role,
    };

    next();
  };
}

export function createAdminAuthMiddleware(adminAuthService: AdminAuthService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (typeof req.headers["x-admin-token"] === "string") {
      token = req.headers["x-admin-token"].trim();
    }

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Admin authentication required. Sign in at /portal/login.",
      });
      return;
    }

    const payload = adminAuthService.verifyToken(token);
    if (!payload) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired admin session token.",
      });
      return;
    }

    req.adminUser = {
      email: payload.email,
      role: payload.role,
    };

    next();
  };
}
