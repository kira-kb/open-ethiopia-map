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
}
