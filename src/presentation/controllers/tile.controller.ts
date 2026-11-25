import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { Logger } from "../../domain/interfaces";
import { PmTilesReader } from "../../infrastructure/tiles/pmtiles.reader";
import { generateVectorStyle } from "./vector-styles";

const TILE_SERVERS: Record<string, (z: string, x: string, y: string) => string> = {
  dark: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
  light: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
  voyager: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  street: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  osm: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  standard: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  satellite: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  topo: (z, x, y) => `https://a.tile.opentopomap.org/${z}/${x}/${y}.png`,
};

function parseBooleanParam(value: unknown): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw ?? "").toLowerCase() === "true";
}

export class TileController {
  private readonly pmTilesReader: PmTilesReader;

  constructor(
    private readonly logger?: Logger,
    pmTilesReader?: PmTilesReader,
  ) {
    this.pmTilesReader = pmTilesReader || new PmTilesReader(undefined, logger);
  }

  /**
   * Serve Self-Hosted Vector Tiles (MVT) from local PMTiles archive
   * GET /api/v1/map/tiles/vector/:z/:x/:y.(mvt|pbf)
   */
  async serveVector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const z = String(req.params.z || "");
      const x = String(req.params.x || "");
      const y = String(req.params.y || "").replace(/\.(mvt|pbf)$/i, "");

      if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
        res.status(400).send("Invalid vector tile coordinates");
        return;
      }

      const zNum = parseInt(z, 10);
      const xNum = parseInt(x, 10);
      const yNum = parseInt(y, 10);

      if (zNum < 0 || zNum > 20) {
        res.status(400).send("Zoom level out of range");
        return;
      }

      const tile = await this.pmTilesReader.getTile(zNum, xNum, yNum);
      if (!tile) {
        res.status(404).send("Vector tile not found");
        return;
      }

      // PmTilesReader returns already-decompressed MVT bytes. Setting
      // Content-Encoding: gzip here makes the browser try to gunzip raw
      // protobuf data, which fails silently and leaves the map blank.
      res.setHeader("Content-Type", "application/vnd.mapbox-vector-tile");
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("X-Tile-Source", "self-hosted-pmtiles");
      res.send(Buffer.from(tile));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Serve Raster Tiles with Write-Through Local Disk Cache
   * GET /api/v1/map/tiles/:style/:z/:x/:y.png
   */
  async serve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const z = String(req.params.z || "");
      const x = String(req.params.x || "");
      const y = String(req.params.y || "").replace(".png", "").replace(".jpg", "");
      const style = String(req.params.style || req.query.style || "dark").toLowerCase();

      if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
        res.status(400).send("Invalid tile coordinates");
        return;
      }

      const zNum = parseInt(z, 10);
      if (zNum < 0 || zNum > 20) {
        res.status(400).send("Zoom level out of range");
        return;
      }

      // Priority 1: Check Local Disk Cache (data/tiles/{style}/{z}/{x}/{y}.png)
      const localCustomTile = path.join(process.cwd(), "data", "tiles", style, z, x, `${y}.png`);
      if (fs.existsSync(localCustomTile)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Tile-Source", "self-hosted-disk-cache");
        fs.createReadStream(localCustomTile).pipe(res);
        return;
      }

      // Priority 2: Fetch and Write-Through to Disk Cache
      const tileUrlBuilder = TILE_SERVERS[style] || TILE_SERVERS.dark;
      const targetUrl = tileUrlBuilder(z, x, y);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "OpenEthiopiaMap/1.0 (https://open-ethiopia-map-isf6.vercel.app)",
            Accept: "image/png,image/jpeg,image/*",
          },
        });

        if (!response.ok) {
          res.status(response.status).send("Tile not available");
          return;
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/png";

        // Write-through to local disk cache asynchronously
        try {
          const tileDir = path.dirname(localCustomTile);
          fs.mkdirSync(tileDir, { recursive: true });
          fs.writeFileSync(localCustomTile, Buffer.from(buffer));
        } catch (writeErr) {
          this.logger?.warn("Failed to write tile to local disk cache", { error: (writeErr as Error).message });
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Tile-Source", "write-through-cache");
        res.send(Buffer.from(buffer));
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * Serve self-hosted font glyph PBFs used by MapLibre symbol layers.
   * GET /api/v1/map/fonts/:fontstack/:range.pbf
   */
  async serveGlyphs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fontstack = String(req.params.fontstack || "");
      const range = String(req.params.range || "").replace(/\.pbf$/i, "");

      // Glyph paths are built from request input: allow only plain font names
      // and numeric ranges so path traversal cannot escape the font directory.
      if (!/^[A-Za-z0-9 _-]+$/.test(fontstack) || !/^\d+-\d+$/.test(range)) {
        res.status(400).send("Invalid glyph range");
        return;
      }

      const relative = path.join("fonts", fontstack, `${range}.pbf`);
      const glyphPath = [
        path.join(process.cwd(), "assets", relative),
        path.join("/app", "assets", relative),
        path.resolve(__dirname, "../../../assets", relative),
      ].find((candidate) => fs.existsSync(candidate));

      if (!glyphPath) {
        res.status(404).send("Glyph range not found");
        return;
      }

      res.setHeader("Content-Type", "application/x-protobuf");
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("X-Glyph-Source", "self-hosted");
      fs.createReadStream(glyphPath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async serveStyle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawStyle = String(req.params.style || "dark").replace(/\.json$/i, "").toLowerCase();
      const style = TILE_SERVERS[rawStyle] ? rawStyle : "dark";
      const lang = (String(req.query?.lang || "default").toLowerCase() as "en" | "am" | "default");
      // Road hierarchy colors are opt-in. Accepted aliases keep older links working.
      const showMainRoads =
        parseBooleanParam(req.query?.showMainRoads) ||
        parseBooleanParam(req.query?.mainRoads) ||
        parseBooleanParam(req.query?.roadColors);

      const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
      const host = req.get("host") || "localhost:8084";
      const baseUrl = `${protocol}://${host}`;

      const hasVectorTiles = this.pmTilesReader.isAvailable();

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      // Style output depends on query params, so never serve a stale cached copy.
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");

      if (hasVectorTiles) {
        const vectorStyle = generateVectorStyle({ baseUrl, style, lang, showMainRoads });
        res.json(vectorStyle);
        return;
      }

      const backgroundColors: Record<string, string> = {
        dark: "#0f172a",
        light: "#f8fafc",
        voyager: "#e2e8f0",
        osm: "#e5e7eb",
        standard: "#e5e7eb",
      };

      const styleSpec = {
        version: 8,
        name: `Open Ethiopia Map - ${style.charAt(0).toUpperCase() + style.slice(1)}`,
        metadata: {
          "openethiopiamap:version": "1.0.0",
          "openethiopiamap:style": style,
          "openethiopiamap:source-type": "raster",
        },
        sources: {
          "ethiopia-raster-tiles": {
            type: "raster",
            tiles: [`${baseUrl}/api/v1/map/tiles/${style}/{z}/{x}/{y}.png`],
            tileSize: 256,
            attribution: "Open Ethiopia Map",
            minzoom: 0,
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": backgroundColors[style] || "#0f172a" },
          },
          {
            id: "ethiopia-base-tiles",
            type: "raster",
            source: "ethiopia-raster-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      };

      res.json(styleSpec);
    } catch (err) {
      next(err);
    }
  }
}
