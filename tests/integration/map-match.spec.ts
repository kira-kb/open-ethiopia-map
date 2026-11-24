import { describe, it, expect } from "vitest";
import { MapMatchUseCase } from "../../src/application/use-cases/map-match.use-case";
import { MapMatchController } from "../../src/presentation/controllers/map-match.controller";

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

describe("MapMatchController (Snap-to-Roads)", () => {
  const useCase = new MapMatchUseCase();
  const controller = new MapMatchController(useCase);

  it("should accept valid GPS trace and return matched coordinates", async () => {
    const req: any = {
      body: {
        profile: "driving",
        coordinates: [
          [38.7615, 9.0102],
          [38.7613, 9.0109],
          [38.7612, 9.0115],
        ],
      },
    };
    const res = createMockResponse();

    await controller.match(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matchedCoordinates).toBeDefined();
    expect(res.body.data.matchedCoordinates.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data.confidence).toBeGreaterThan(0.5);
  });

  it("should reject payload with fewer than 2 points with 400", async () => {
    const req: any = {
      body: {
        profile: "driving",
        coordinates: [[38.7615, 9.0102]], // Only 1 point
      },
    };
    const res = createMockResponse();

    await controller.match(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid coordinates out of range with 400", async () => {
    const req: any = {
      body: {
        profile: "driving",
        coordinates: [
          [200, 9.0102], // Invalid longitude 200
          [38.7613, 9.0109],
        ],
      },
    };
    const res = createMockResponse();

    await controller.match(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
