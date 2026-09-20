import { Request, Response, NextFunction } from "express";
import { Logger } from "../../domain/interfaces";

const TILE_SERVERS: Record<string, (z: string, x: string, y: string) => string> = {
  dark: (z, x, y) => `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`,
  light: (z, x, y) => `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
  voyager: (z, x, y) => `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`,
  osm: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  standard: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
};

export class TileController {
  constructor(private readonly logger?: Logger) {}

  async serve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const z = String(req.params.z || "");
      const x = String(req.params.x || "");
      const y = String(req.params.y || "").replace(".png", "");
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

      const tileUrlBuilder = TILE_SERVERS[style] || TILE_SERVERS.dark;
      const targetUrl = tileUrlBuilder(z, x, y);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "OpenEthiopiaMap/1.0 (https://open-ethiopia-map-isf6.vercel.app)",
            Accept: "image/png,image/*",
          },
        });

        if (!response.ok) {
          res.status(response.status).send("Tile not available");
          return;
        }

        const buffer = await response.arrayBuffer();

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
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
