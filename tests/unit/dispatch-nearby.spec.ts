import { describe, it, expect } from "vitest";
import { DispatchNearbyUseCase } from "../../src/application/use-cases/dispatch-nearby.use-case";
import { ComputeMatrixUseCase } from "../../src/application/use-cases/compute-matrix.use-case";
import { DispatchController } from "../../src/presentation/controllers/dispatch.controller";
import { StructuredLogger } from "../../src/infrastructure/logging/structured.logger";

describe("DispatchNearbyUseCase & DispatchController", () => {
  const logger = new StructuredLogger("test", "error");
  const computeMatrix = new ComputeMatrixUseCase(logger);

  // Mock Redis Cache
  const mockRedisClient = {
    geosearch: async (key: string, ...args: any[]) => {
      // Mock 3 drivers around Meskel Square
      return [
        ["drv_1", "1.2", ["38.7600", "9.0120"]], // 1.2km away
        ["drv_2", "0.5", ["38.7700", "9.0150"]], // 0.5km away (across barrier, longer road)
        ["drv_3", "2.1", ["38.7800", "9.0200"]], // 2.1km away
      ];
    },
    smembers: async (key: string) => {
      if (key === "filtered_drivers:del_declined_1") {
        return ["drv_2"]; // drv_2 declined this delivery
      }
      return [];
    },
    pipeline: () => ({
      hget: () => {},
      hmget: () => {},
      exec: async () => [
        [null, ["BAJAJ", "9.0120", "38.7600"]],
        [null, ["CAR", "9.0150", "38.7700"]],
        [null, ["BAJAJ", "9.0200", "38.7800"]],
      ],
    }),
  };

  const mockCache: any = {
    getRawClient: () => mockRedisClient,
  };

  it("should rank explicit candidates by road duration instead of Euclidean distance", async () => {
    const dispatchUseCase = new DispatchNearbyUseCase(computeMatrix, mockCache, logger);

    const pickup = { latitude: 9.0108, longitude: 38.7615 }; // Meskel Sq

    // Driver A: straight-line closer (300m), but let's give coordinates that require detour
    // Driver B: straight-line farther (600m), but direct avenue
    const candidates = [
      { driverId: "drv_closer_straight", latitude: 9.0130, longitude: 38.7615, vehicleType: "bajaj" },
      { driverId: "drv_farther_straight", latitude: 9.0180, longitude: 38.7615, vehicleType: "bajaj" },
    ];

    const result = await dispatchUseCase.execute({
      pickup,
      vehicleType: "bajaj",
      candidates,
      radiusKm: 5,
      limit: 10,
      geoKey: "active_drivers",
      profilePrefix: "driver:",
    });

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
    expect(result.candidates[0].roadDistanceMeters).toBeDefined();
    expect(result.candidates[0].roadDurationSeconds).toBeDefined();
    expect(result.candidates[0].etaMinutes).toBeGreaterThan(0);
    // Ordered ascending by duration
    expect(result.candidates[0].roadDurationSeconds).toBeLessThanOrEqual(result.candidates[1].roadDurationSeconds);
  });

  it("should query Redis GEO active_drivers, filter excluded drivers, and rank candidates", async () => {
    const dispatchUseCase = new DispatchNearbyUseCase(computeMatrix, mockCache, logger);

    const pickup = { latitude: 9.0108, longitude: 38.7615 };

    const result = await dispatchUseCase.execute({
      pickup,
      vehicleType: "any",
      deliveryId: "del_declined_1", // drv_2 is excluded
      radiusKm: 5,
      limit: 10,
      geoKey: "active_drivers",
      profilePrefix: "driver:",
    });

    expect(result.success).toBe(true);
    // drv_2 was excluded by filtered_drivers:del_declined_1
    const driverIds = result.candidates.map((c) => c.driverId);
    expect(driverIds).not.toContain("drv_2");
    expect(driverIds).toContain("drv_1");
    expect(driverIds).toContain("drv_3");
  });

  it("should handle HTTP controller validation and return 400 on invalid body", async () => {
    const dispatchUseCase = new DispatchNearbyUseCase(computeMatrix, mockCache, logger);
    const controller = new DispatchController(dispatchUseCase, logger);

    let statusCode = 200;
    let jsonPayload: any = null;

    const req: any = {
      body: {
        // Missing required pickup coordinates
        vehicleType: "bajaj",
      },
    };
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (d: any) => (jsonPayload = d) };
      },
    };

    await controller.findNearby(req, res);
    expect(statusCode).toBe(400);
    expect(jsonPayload?.error).toBe("Invalid dispatch request");
  });
});
