import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { ApiKey } from "../../src/domain/entities/api-key.entity";
import { ApiKeyStore } from "../../src/infrastructure/database/api-key.store";
import { AdminAuthService } from "../../src/application/services/admin-auth.service";
import {
  createApiKeyAuthMiddleware,
  createAdminAuthMiddleware,
  AuthenticatedRequest,
} from "../../src/presentation/middleware/api-key-auth";
import { AdminPortalController } from "../../src/presentation/controllers/admin-portal.controller";

describe("API Key Authentication & Management System", () => {
  const testDataFile = path.resolve(__dirname, "test-api-keys.json");
  let apiKeyStore: ApiKeyStore;
  let adminAuthService: AdminAuthService;

  beforeEach(() => {
    if (fs.existsSync(testDataFile)) {
      fs.unlinkSync(testDataFile);
    }
    apiKeyStore = new ApiKeyStore(testDataFile);
    adminAuthService = new AdminAuthService(apiKeyStore, "test_secret_key");
  });

  afterEach(() => {
    if (fs.existsSync(testDataFile)) {
      fs.unlinkSync(testDataFile);
    }
  });

  describe("ApiKey Entity & Permission Scopes", () => {
    it("should allow service key to access all methods and endpoints", () => {
      const serviceKey = new ApiKey({
        id: "key_1",
        name: "Ride Backend",
        key: "sk_live_12345",
        role: "service",
        rateLimit: 600,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      expect(serviceKey.isServiceKey()).toBe(true);
      expect(serviceKey.canAccessPath("/api/v1/map/route", "POST")).toBe(true);
      expect(serviceKey.canAccessPath("/api/v1/map/match", "POST")).toBe(true);
      expect(serviceKey.canAccessPath("/api/v1/map/tiles/vector/1/2/3.pbf", "GET")).toBe(true);
    });

    it("should restrict public key strictly to read-only tiles and search", () => {
      const publicKey = new ApiKey({
        id: "key_2",
        name: "Driver MapLibre",
        key: "pk_live_67890",
        role: "public",
        rateLimit: 1200,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      expect(publicKey.isPublicKey()).toBe(true);
      // Allowed GET endpoints
      expect(publicKey.canAccessPath("/api/v1/map/tiles/vector/14/987/654.pbf", "GET")).toBe(true);
      expect(publicKey.canAccessPath("/api/v1/map/styles/dark.json", "GET")).toBe(true);
      expect(publicKey.canAccessPath("/api/v1/map/autocomplete", "GET")).toBe(true);
      expect(publicKey.canAccessPath("/api/v1/map/nearby", "GET")).toBe(true);
      expect(publicKey.canAccessPath("/api/v1/map/reverse-geocode", "GET")).toBe(true);

      // Blocked POST/PUT/DELETE and backend routing
      expect(publicKey.canAccessPath("/api/v1/map/route", "POST")).toBe(false);
      expect(publicKey.canAccessPath("/api/v1/map/routes/create", "POST")).toBe(false);
      expect(publicKey.canAccessPath("/api/v1/map/traffic/telemetry", "POST")).toBe(false);
      expect(publicKey.canAccessPath("/api/v1/map/match", "POST")).toBe(false);
      expect(publicKey.canAccessPath("/api/v1/map/tiles/vector", "POST")).toBe(false);
    });

    it("should reject any access if key is deactivated", () => {
      const inactiveKey = new ApiKey({
        id: "key_3",
        name: "Disabled Key",
        key: "sk_live_revoked",
        role: "service",
        rateLimit: 600,
        isActive: false,
        createdAt: new Date().toISOString(),
      });

      expect(inactiveKey.canAccessPath("/api/v1/map/route", "POST")).toBe(false);
      expect(inactiveKey.canAccessPath("/api/v1/map/tiles/vector/1/2/3.pbf", "GET")).toBe(false);
    });
  });

  describe("ApiKeyStore CRUD & Admin Credentials", () => {
    it("should verify admin credentials with kirubelbewket@gmail.com and Pass@123", () => {
      expect(apiKeyStore.verifyAdminCredentials("kirubelbewket@gmail.com", "Pass@123")).toBe(true);
      expect(apiKeyStore.verifyAdminCredentials("KIRUBELBEWKET@gmail.com", "Pass@123")).toBe(true); // case-insensitive email
      expect(apiKeyStore.verifyAdminCredentials("kirubelbewket@gmail.com", "WrongPassword")).toBe(false);
      expect(apiKeyStore.verifyAdminCredentials("other@gmail.com", "Pass@123")).toBe(false);
    });

    it("should seed default production keys when initialized", async () => {
      const keys = await apiKeyStore.listAll();
      expect(keys.length).toBeGreaterThanOrEqual(4);

      const rideKey = await apiKeyStore.findByKey("sk_ride_live_addis_7f8a92bcde10");
      expect(rideKey).not.toBeNull();
      expect(rideKey?.name).toContain("Ride-Hailing");
      expect(rideKey?.role).toBe("service");

      const driverKey = await apiKeyStore.findByKey("pk_driver_live_44e9b277ac11");
      expect(driverKey).not.toBeNull();
      expect(driverKey?.role).toBe("public");
    });

    it("should create, update, and delete an API key", async () => {
      const created = await apiKeyStore.create({
        name: "Gondar Bajaj Dispatcher",
        role: "service",
        rateLimit: 500,
      });

      expect(created.id).toBeDefined();
      expect(created.key.startsWith("sk_live_")).toBe(true);
      expect(created.name).toBe("Gondar Bajaj Dispatcher");

      // Verify retrieval
      const found = await apiKeyStore.findByKey(created.key);
      expect(found?.id).toBe(created.id);

      // Update
      const updated = await apiKeyStore.update(created.id, {
        name: "Gondar Bajaj Dispatcher V2",
        isActive: false,
      });
      expect(updated?.name).toBe("Gondar Bajaj Dispatcher V2");
      expect(updated?.isActive).toBe(false);

      // Delete
      const deleted = await apiKeyStore.delete(created.id);
      expect(deleted).toBe(true);

      const afterDelete = await apiKeyStore.findById(created.id);
      expect(afterDelete).toBeNull();
    });
  });

  describe("AdminAuthService", () => {
    it("should issue signed token on valid login and reject invalid login", () => {
      const success = adminAuthService.login("kirubelbewket@gmail.com", "Pass@123");
      expect(success).not.toBeNull();
      expect(success?.token).toBeDefined();
      expect(success?.user.email).toBe("kirubelbewket@gmail.com");

      const fail = adminAuthService.login("kirubelbewket@gmail.com", "wrong");
      expect(fail).toBeNull();
    });

    it("should verify valid admin token and reject tampered token", () => {
      const loginResult = adminAuthService.login("kirubelbewket@gmail.com", "Pass@123")!;
      const verified = adminAuthService.verifyToken(loginResult.token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe("kirubelbewket@gmail.com");
      expect(verified?.role).toBe("admin");

      // Tampered token
      const tampered = loginResult.token + "tampered";
      expect(adminAuthService.verifyToken(tampered)).toBeNull();
    });
  });

  describe("API Key Middleware Execution", () => {
    it("should reject requests missing API key with 401", async () => {
      const middleware = createApiKeyAuthMiddleware(apiKeyStore);
      let statusCode = 0;
      let jsonPayload: any = null;

      const req: any = {
        path: "/api/v1/map/route",
        method: "POST",
        headers: {},
        query: {},
      };
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              jsonPayload = payload;
            },
          };
        },
      };
      let nextCalled = false;

      await middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(401);
      expect(jsonPayload?.error).toBe("Unauthorized");
    });

    it("should allow request with valid X-API-Key header", async () => {
      const middleware = createApiKeyAuthMiddleware(apiKeyStore);
      const req: any = {
        path: "/api/v1/map/route",
        method: "POST",
        headers: { "x-api-key": "sk_ride_live_addis_7f8a92bcde10" },
        query: {},
      };
      const res: any = {};
      let nextCalled = false;

      await middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.project?.name).toBe("Ride-Hailing Production Backend");
    });

    it("should allow vector tile request with ?key= query parameter", async () => {
      const middleware = createApiKeyAuthMiddleware(apiKeyStore);
      const req: any = {
        path: "/api/v1/map/tiles/vector/14/987/654.pbf",
        method: "GET",
        headers: {},
        query: { key: "pk_driver_live_44e9b277ac11" },
      };
      const res: any = {};
      let nextCalled = false;

      await middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.apiKey.role).toBe("public");
    });

    it("should block public key from calling POST /api/v1/map/route with 403 Forbidden", async () => {
      const middleware = createApiKeyAuthMiddleware(apiKeyStore);
      let statusCode = 0;
      let jsonPayload: any = null;

      const req: any = {
        path: "/api/v1/map/route",
        method: "POST",
        headers: { "x-api-key": "pk_driver_live_44e9b277ac11" },
        query: {},
      };
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              jsonPayload = payload;
            },
          };
        },
      };
      let nextCalled = false;

      await middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(403);
      expect(jsonPayload?.error).toBe("Forbidden");
    });
  });

  describe("AdminPortalController End-to-End", () => {
    it("should login admin and render developer portal HTML", async () => {
      const controller = new AdminPortalController(apiKeyStore, adminAuthService);

      // Test login
      let loginStatus = 200;
      let loginData: any = null;
      const loginReq: any = {
        body: { email: "kirubelbewket@gmail.com", password: "Pass@123" },
      };
      const loginRes: any = {
        status: (code: number) => {
          loginStatus = code;
          return { json: (d: any) => (loginData = d) };
        },
        json: (d: any) => (loginData = d),
      };

      await controller.login(loginReq, loginRes);
      expect(loginData?.success).toBe(true);
      expect(loginData?.token).toBeDefined();

      // Test HTML portal page
      let htmlBody = "";
      const portalReq: any = {};
      const portalRes: any = {
        setHeader: () => {},
        send: (html: string) => {
          htmlBody = html;
        },
      };

      controller.servePortalPage(portalReq, portalRes);
      expect(htmlBody).toContain("Open Ethiopia Map Portal");
      expect(htmlBody).toContain("kirubelbewket@gmail.com");
      expect(htmlBody).toContain("Generate API Key");
    });
  });
});
