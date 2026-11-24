import { describe, it, expect } from "vitest";
import { IngestTelemetryUseCase } from "../../src/application/use-cases/ingest-telemetry.use-case";
import { TelemetryController } from "../../src/presentation/controllers/telemetry.controller";
import { ICache } from "../../src/domain/interfaces";

class MockMemoryCache implements ICache {
  private store = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    body: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe("Driver Telemetry & Live Traffic Ingestion", () => {
  const cache = new MockMemoryCache();
  const useCase = new IngestTelemetryUseCase(cache);
  const controller = new TelemetryController(useCase);

  it("should ingest driver GPS pings and detect congestion when speed < 15 km/h", async () => {
    const req: any = {
      body: {
        driverId: "driver_addis_101",
        profile: "driving",
        pings: [
          { lat: 9.0105, lng: 38.7612, speedKmh: 12.0, bearing: 180 },
          { lat: 9.0112, lng: 38.7620, speedKmh: 10.5, bearing: 182 },
        ],
      },
    };
    const res = createMockResponse();

    await controller.ingest(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.processedPings).toBe(2);
    expect(res.body.data.averageSpeedKmh).toBe(11.3);
    expect(res.body.data.congestedSegmentsRecorded).toBe(2);

    // Verify written to cache
    const cachedSegment = await cache.get<any>("traffic:segment:9.011:38.761:driving");
    expect(cachedSegment).toBeDefined();
    expect(cachedSegment.congestionLevel).toBe("heavy");
  });

  it("should record normal flow when speeds are healthy", async () => {
    const req: any = {
      body: {
        driverId: "driver_gondar_55",
        profile: "bajaj",
        pings: [
          { lat: 12.6078, lng: 37.4697, speedKmh: 24.0, bearing: 90 },
        ],
      },
    };
    const res = createMockResponse();

    await controller.ingest(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.data.congestedSegmentsRecorded).toBe(0);
  });

  it("should reject invalid telemetry payloads with 400", async () => {
    const req: any = {
      body: {
        driverId: "", // Empty string fails .min(1)
        pings: [],
      },
    };
    const res = createMockResponse();

    await controller.ingest(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
