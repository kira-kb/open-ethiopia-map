import { describe, it, expect } from "vitest";
import { ComputeMatrixUseCase } from "../../src/application/use-cases/compute-matrix.use-case";
import { MatrixController } from "../../src/presentation/controllers/matrix.controller";
import { SessionCache } from "../../src/infrastructure/cache/session.cache";
import { ManeuverLocalizer } from "../../src/domain/services/routing/maneuver-localizer";
import { EmergencyFallbackRouteProvider } from "../../src/infrastructure/providers/route/emergency-fallback.provider";
import { Coordinates } from "../../src/domain/value-objects";
import { StructuredLogger } from "../../src/infrastructure/logging/structured.logger";

describe("Production Dispatch Matrix, Session Delivery Cache, and Amharic Localization", () => {
  const logger = new StructuredLogger("test", "error");

  describe("1. Distance Matrix API (ComputeMatrixUseCase & MatrixController)", () => {
    const computeMatrix = new ComputeMatrixUseCase(logger);

    it("should compute an N x M matrix of durations and distances for multi-driver dispatch", async () => {
      // 3 Drivers in Bole/Kazanchis -> 1 Passenger at Meskel Square
      const origins = [
        { latitude: 8.9806, longitude: 38.7997 }, // Driver 1: Bole Airport (~4km)
        { latitude: 9.0185, longitude: 38.7725 }, // Driver 2: Kazanchis (~1.5km)
        { latitude: 9.0354, longitude: 38.7516 }, // Driver 3: Piassa (~3km)
      ];
      const destinations = [
        { latitude: 9.0108, longitude: 38.7615 }, // Rider: Meskel Square
      ];

      const result = await computeMatrix.execute({
        origins,
        destinations,
        profile: "car",
        annotations: ["duration", "distance"],
      });

      expect(result.durations.length).toBe(3);
      expect(result.durations[0].length).toBe(1);
      expect(result.distances.length).toBe(3);

      // Kazanchis is closest to Meskel Square, so Driver 2 duration < Driver 1 duration
      const driver1Duration = result.durations[0][0]!;
      const driver2Duration = result.durations[1][0]!;
      expect(driver2Duration).toBeLessThan(driver1Duration);

      expect(result.distances[0][0]).toBeGreaterThan(2000);
      expect(result.profile).toBe("car");
    });

    it("should calibrate Bajaj travel durations with lower speeds than cars", async () => {
      const origins = [{ latitude: 12.6078, longitude: 37.4697 }]; // Gondar Piassa
      const destinations = [{ latitude: 12.5350, longitude: 37.4380 }]; // Gondar Azezo (~8km)

      const carMatrix = await computeMatrix.execute({
        origins,
        destinations,
        profile: "car",
        annotations: ["duration", "distance"],
      });

      const bajajMatrix = await computeMatrix.execute({
        origins,
        destinations,
        profile: "bajaj",
        annotations: ["duration", "distance"],
      });

      const carDuration = carMatrix.durations[0][0]!;
      const bajajDuration = bajajMatrix.durations[0][0]!;

      // Bajaj speed cap (20 km/h) means travel time is noticeably longer than car (38 km/h)
      expect(bajajDuration).toBeGreaterThan(carDuration);
    });

    it("should handle HTTP controller validation and return 400 on empty coordinates", async () => {
      const controller = new MatrixController(computeMatrix, logger);
      let statusCode = 200;
      let jsonPayload: any = null;

      const req: any = {
        body: {
          origins: [], // Invalid: empty
          destinations: [{ latitude: 9.0, longitude: 38.7 }],
        },
      };
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return { json: (d: any) => (jsonPayload = d) };
        },
      };

      await controller.compute(req, res);
      expect(statusCode).toBe(400);
      expect(jsonPayload?.error).toContain("Invalid matrix request");
    });
  });

  describe("2. Route Session Delivery Cache (session:delivery:{deliveryId} & Sliding TTL)", () => {
    // In-memory mock cache for testing
    class MockCache {
      private store = new Map<string, { val: any; ttl: number }>();
      async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key);
        return item ? item.val : null;
      }
      async set<T>(key: string, val: T, ttl: number): Promise<void> {
        this.store.set(key, { val, ttl });
      }
      async del(key: string): Promise<void> {
        this.store.delete(key);
      }
      has(key: string): boolean {
        return this.store.has(key);
      }
    }

    it("should cache by sessionId and index by deliveryId with sliding TTL", async () => {
      const mock = new MockCache();
      const sessionCache = new SessionCache(mock as any);

      const session = {
        id: "sess_addis_delivery_991",
        deliveryId: "del_order_5521",
        provider: "osrm",
        profile: "bajaj",
        distanceMeters: 4200,
        durationSeconds: 840,
        geometry: { type: "LineString", coordinates: [[38.7, 9.0], [38.71, 9.01]] },
        instructions: null,
        currentRevision: 1,
        status: "active",
      };

      await sessionCache.set(session);

      // Verify deliveryId -> sessionId resolution
      const resolvedSessionId = await sessionCache.getSessionIdByDeliveryId("del_order_5521");
      expect(resolvedSessionId).toBe("sess_addis_delivery_991");

      // Verify session lookup
      const cachedData = await sessionCache.get("sess_addis_delivery_991");
      expect(cachedData).not.toBeNull();
      expect(cachedData?.deliveryId).toBe("del_order_5521");
      expect(cachedData?.profile).toBe("bajaj");

      // Invalidate with deliveryId
      await sessionCache.invalidate("sess_addis_delivery_991", "del_order_5521");
      expect(await sessionCache.get("sess_addis_delivery_991")).toBeNull();
      expect(await sessionCache.getSessionIdByDeliveryId("del_order_5521")).toBeNull();
    });
  });

  describe("3. Amharic Navigation Localization (ManeuverLocalizer)", () => {
    it("should format turn maneuvers into natural Amharic", () => {
      expect(ManeuverLocalizer.format({ type: "turn", modifier: "left", name: "Churchill Ave" }, "am"))
        .toBe("በግራ ታጠፍ በChurchill Ave");

      expect(ManeuverLocalizer.format({ type: "turn", modifier: "right", name: "Bole Road" }, "am"))
        .toBe("በቀኝ ታጠፍ በBole Road");

      expect(ManeuverLocalizer.format({ type: "turn", modifier: "sharp left" }, "am"))
        .toBe("በጣም ወደ ግራ ታጠፍ");

      expect(ManeuverLocalizer.format({ type: "turn", modifier: "slight right" }, "am"))
        .toBe("ትንሽ ወደ ቀኝ ታጠፍ");

      expect(ManeuverLocalizer.format({ type: "turn", modifier: "uturn" }, "am"))
        .toBe("የዩ-ቅርጽ መታጠፊያ (U-turn) አድርግ");
    });

    it("should format departure, arrival, and straight instructions in Amharic", () => {
      expect(ManeuverLocalizer.format({ type: "depart", name: "Bole Brass" }, "am"))
        .toBe("በBole Brass ጉዞ ይጀምሩ");

      expect(ManeuverLocalizer.format({ type: "arrive" }, "am"))
        .toBe("መድረሻዎ ደርሰዋል");

      expect(ManeuverLocalizer.format({ type: "continue", name: "Ring Road" }, "am"))
        .toBe("በRing Road ቀጥታ ይቀጥሉ");

      expect(ManeuverLocalizer.format({ type: "fork", modifier: "left" }, "am"))
        .toBe("ከመንታ መንገዱ በግራ በኩል ያዙ");
    });

    it("should format English maneuvers by default", () => {
      expect(ManeuverLocalizer.format({ type: "turn", modifier: "right", name: "Bole Road" }, "en"))
        .toBe("Turn right on Bole Road");

      expect(ManeuverLocalizer.format({ type: "arrive" }, "en"))
        .toBe("You have arrived at your destination");
    });

    it("should generate Amharic instructions in emergency fallback provider", async () => {
      const fallbackProvider = new EmergencyFallbackRouteProvider();
      const origin = new Coordinates(9.0108, 38.7615); // Meskel Square
      const destination = new Coordinates(8.9806, 38.7997); // Bole Airport

      const res = await fallbackProvider.route({
        origin,
        destination,
        profile: "driving",
        lang: "am",
      });

      expect(res.routes.length).toBe(1);
      const step = res.routes[0].steps?.[0];
      expect(step).toBeDefined();
      expect(step?.instruction).toContain("ቀጥታ ይቀጥሉ");
      expect(step?.instruction).toContain("ሜ"); // meters in Amharic
    });
  });

  describe("4. Universal Language Resolution (Query Param, Header, Body)", () => {
    // Dynamic import to test EthiopianTranslator
    it("should resolve language via URL query parameter (?lang=am, ?l=am)", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      expect(EthiopianTranslator.resolveLanguage({ query: { lang: "am" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ query: { l: "am" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ query: { language: "amharic" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ query: { lang: "en" } })).toBe("en");
    });

    it("should resolve language via HTTP headers (x-lang, accept-language)", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      expect(EthiopianTranslator.resolveLanguage({ headers: { "x-lang": "am" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ headers: { "x-language": "am" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ headers: { "accept-language": "am,en;q=0.9" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ headers: { "accept-language": "en-US,en;q=0.9" } })).toBe("en");
    });

    it("should resolve language via JSON body ({ lang: 'am' })", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      expect(EthiopianTranslator.resolveLanguage({ body: { lang: "am" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ body: { language: "amharic" } })).toBe("am");
      expect(EthiopianTranslator.resolveLanguage({ body: { lang: "en" } })).toBe("en");
    });

    it("should default to English when no language parameter is provided", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      expect(EthiopianTranslator.resolveLanguage({})).toBe("en");
      expect(EthiopianTranslator.resolveLanguage({ query: {}, headers: {}, body: {} })).toBe("en");
    });

    it("should format distance and duration properly in Amharic and English", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      // Distance
      expect(EthiopianTranslator.formatDistance(450, "am")).toBe("450 ሜትር");
      expect(EthiopianTranslator.formatDistance(450, "en")).toBe("450 m");
      expect(EthiopianTranslator.formatDistance(3200, "am")).toBe("3.2 ኪ.ሜ");
      expect(EthiopianTranslator.formatDistance(3200, "en")).toBe("3.2 km");

      // Duration
      expect(EthiopianTranslator.formatDuration(45, "am")).toBe("45 ሰከንድ");
      expect(EthiopianTranslator.formatDuration(45, "en")).toBe("45 sec");
      expect(EthiopianTranslator.formatDuration(900, "am")).toBe("15 ደቂቃ");
      expect(EthiopianTranslator.formatDuration(900, "en")).toBe("15 mins");
      expect(EthiopianTranslator.formatDuration(4500, "am")).toBe("1 ሰዓት ከ15 ደቂቃ");
    });

    it("should translate vehicle types and Ethiopian landmarks", async () => {
      const { EthiopianTranslator } = await import("../../src/domain/services/localization/ethiopian-translator");

      expect(EthiopianTranslator.translateVehicle("bajaj", "am")).toBe("ባጃጅ");
      expect(EthiopianTranslator.translateVehicle("car", "am")).toBe("መኪና");
      expect(EthiopianTranslator.translateVehicle("motorcycle", "am")).toBe("ሞተር ሳይክል");

      expect(EthiopianTranslator.translateCity("addis ababa", "am")).toBe("አዲስ አበባ");
      expect(EthiopianTranslator.translateCity("gondar", "am")).toBe("ጎንደር");

      expect(EthiopianTranslator.translatePlaceName("fasil ghebbi", "am")).toBe("ፋሲል ግቢ");
      expect(EthiopianTranslator.translatePlaceName("meskel square", "am")).toBe("መስቀል አደባባይ");
    });
  });
});
