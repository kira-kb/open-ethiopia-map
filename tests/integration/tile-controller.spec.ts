import { describe, it, expect } from "vitest";
import { TileController } from "../../src/presentation/controllers/tile.controller";

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    send(data: any) {
      this.body = data;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe("TileController (Self-Hosted Vector & Cached Raster Tiles)", () => {
  const tileController = new TileController();

  it("should return valid MapLibre Style JSON for dark style", async () => {
    const req: any = {
      params: { style: "dark" },
      headers: {},
      get: () => "localhost:8084",
      protocol: "http",
    };
    const res = createMockResponse();

    await tileController.serveStyle(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.body.version).toBe(8);
    expect(res.body.name).toBe("Open Ethiopia Map - Dark");
    expect(res.body.sources).toBeDefined();
    expect(res.body.layers).toBeDefined();
    expect(res.headers["cache-control"]).toBeDefined();
  });

  it("should reject invalid tile coordinates with 400", async () => {
    const req: any = {
      params: { style: "dark", z: "invalid", x: "10", y: "20.png" },
      query: {},
    };
    const res = createMockResponse();

    await tileController.serve(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("Invalid tile coordinates");
  });

  it("should reject zoom levels out of range with 400", async () => {
    const req: any = {
      params: { style: "dark", z: "25", x: "10", y: "20.png" },
      query: {},
    };
    const res = createMockResponse();

    await tileController.serve(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("Zoom level out of range");
  });

  it("should return 404 for vector tiles when archive file is not yet generated", async () => {
    const req: any = {
      params: { z: "12", x: "2345", y: "1560.mvt" },
    };
    const res = createMockResponse();

    await tileController.serveVector(req, res, () => {});

    expect(res.statusCode).toBe(404);
    expect(res.body).toContain("Vector tile not found");
  });
});
