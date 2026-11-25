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

  it("should serve decompressed MVT bytes without a gzip Content-Encoding header", async () => {
    // PMTiles.getZxy() returns already-decompressed data. Advertising gzip
    // here makes browsers fail to decode the tile and leaves the map blank.
    const rawMvt = Buffer.from([0x1a, 0x02, 0x0a, 0x00]);
    const mockReader = {
      getTile: async () => rawMvt.buffer.slice(rawMvt.byteOffset, rawMvt.byteOffset + rawMvt.byteLength),
    };
    const controller = new TileController(undefined, mockReader as any);
    const req: any = { params: { z: "12", x: "2489", y: "1945.mvt" } };
    const res = createMockResponse();

    await controller.serveVector(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-encoding"]).toBeUndefined();
    expect(res.headers["content-type"]).toBe("application/vnd.mapbox-vector-tile");
    expect(Buffer.from(res.body)).toEqual(rawMvt);
  });

  it("should reject glyph requests with an unsafe font stack", async () => {
    const req: any = {
      params: { fontstack: "../secrets", range: "0-255.pbf" },
    };
    const res = createMockResponse();

    await tileController.serveGlyphs(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("Invalid glyph range");
  });

  it("should reject glyph requests with a malformed range", async () => {
    const req: any = {
      params: { fontstack: "Noto Sans Regular", range: "0-255;rm" },
    };
    const res = createMockResponse();

    await tileController.serveGlyphs(req, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("Invalid glyph range");
  });

  function roadLayer(style: any, id: string): any {
    return style.layers.find((layer: any) => layer.id === id);
  }

  function styleRequest(query: Record<string, string> = {}): any {
    return {
      params: { style: "dark" },
      query,
      headers: {},
      get: () => "localhost:8084",
      protocol: "http",
    };
  }

  it("should use one neutral road color by default (mapcn-like)", async () => {
    const controller = new TileController(undefined, { isAvailable: () => true } as any);
    const res = createMockResponse();

    await controller.serveStyle(styleRequest(), res, () => {});

    const uniformRoadIds = [
      "road-service",
      "road-minor",
      "road-secondary-tertiary",
      "road-primary",
      "road-trunk",
      "road-motorway",
    ];
    for (const id of uniformRoadIds) {
      expect(roadLayer(res.body, id).paint["line-color"]).toBe("#414758");
      expect(roadLayer(res.body, id).paint["line-opacity"] ?? 1).toBe(1);
    }
    expect(res.body.metadata["openethiopiamap:main-roads"]).toBe("uniform");
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("should show colored main roads only when showMainRoads=true", async () => {
    const controller = new TileController(undefined, { isAvailable: () => true } as any);
    const res = createMockResponse();

    await controller.serveStyle(styleRequest({ showMainRoads: "true" }), res, () => {});

    expect(roadLayer(res.body, "road-motorway").paint["line-color"]).toBe("#f59e0b");
    expect(roadLayer(res.body, "road-trunk").paint["line-color"]).toBe("#fbbf24");
    expect(roadLayer(res.body, "road-primary").paint["line-color"]).toBe("#38bdf8");
    expect(roadLayer(res.body, "road-secondary-tertiary").paint["line-color"]).toBe("#0284c7");
    expect(roadLayer(res.body, "road-motorway").paint["line-opacity"]).toBe(0.6);
    expect(res.body.metadata["openethiopiamap:main-roads"]).toBe("colored");
  });

  it("should accept mainRoads=true as an alias for showMainRoads", async () => {
    const controller = new TileController(undefined, { isAvailable: () => true } as any);
    const res = createMockResponse();

    await controller.serveStyle(styleRequest({ mainRoads: "true" }), res, () => {});

    expect(roadLayer(res.body, "road-motorway").paint["line-color"]).toBe("#f59e0b");
    expect(res.body.metadata["openethiopiamap:main-roads"]).toBe("colored");
  });
});
