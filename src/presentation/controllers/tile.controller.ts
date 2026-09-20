import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { Logger } from "../../domain/interfaces";

// 100% Free, Zero API Keys, Unmetered, No Watermarks
const TILE_SERVERS: Record<string, (z: string, x: string, y: string) => string> = {
  // Esri Canvas Dark Gray (Clean dark cartography, zero watermark, no API key)
  dark: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
  // Esri Canvas Light Gray (Clean minimal light cartography, zero watermark, no API key)
  light: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
  // Esri World Street Map (High-resolution global & Ethiopian road arteries, no API key)
  voyager: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  street: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  // OpenStreetMap Official (Zero watermark, community open-source, no API key)
  osm: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  standard: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  // OpenTopoMap (Contour elevation & topography, no API key)
  topo: (z, x, y) => `https://a.tile.opentopomap.org/${z}/${x}/${y}.png`,
};

export class TileController {
  constructor(private readonly logger?: Logger) {}

  async serve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const z = String(req.params.z || "");
      const x = String(req.params.x || "");
      const y = String(req.params.y || "").replace(".png", "").replace(".jpg", "");
      const style = String(req.params.style || req.query.style || "dark").toLowerCase();

      // Validate tile coordinates
      if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
        res.status(400).send("Invalid tile coordinates");
        return;
      }

      const zNum = parseInt(z, 10);
      if (zNum < 0 || zNum > 20) {
        res.status(400).send("Zoom level out of range");
        return;
      }

      // ── Priority 1: Self-Rendered Local Custom Tiles ───────────────
      // If the platform renders its own tiles, serve directly from data/tiles/{style}/{z}/{x}/{y}.png
      const localCustomTile = path.join(process.cwd(), "data", "tiles", style, z, x, `${y}.png`);
      if (fs.existsSync(localCustomTile)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Tile-Source", "self-hosted-local");
        fs.createReadStream(localCustomTile).pipe(res);
        return;
      }

      // ── Priority 2: 100% Free Public Tile Mirrors (No API Key) ────
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

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Tile-Source", "open-free-mirror");
        res.send(Buffer.from(buffer));
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      next(err);
    }
  }

  async serveStyle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawStyle = String(req.params.style || "dark").replace(/\.json$/i, "").toLowerCase();
      const style = TILE_SERVERS[rawStyle] ? rawStyle : "dark";

      const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
      const host = req.get("host") || "localhost:8084";
      const baseUrl = `${protocol}://${host}`;

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
        },
        sources: {
          "ethiopia-raster-tiles": {
            type: "raster",
            tiles: [`${baseUrl}/api/v1/map/tiles/${style}/{z}/{x}/{y}.png`],
            tileSize: 256,
            attribution: "© Open Ethiopia Map | OpenStreetMap contributors",
            minzoom: 0,
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": backgroundColors[style] || "#0f172a",
            },
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

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(styleSpec);
    } catch (err) {
      next(err);
    }
  }
}
