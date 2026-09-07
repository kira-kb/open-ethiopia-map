import { IScraper } from "./interfaces/scraper.interface";
import fs from "fs";
import path from "path";

const SCRAPERS_DIR = __dirname;

export function discoverScrapers(logger: { warn: (msg: string, meta?: Record<string, unknown>) => void }): Map<string, IScraper> {
  const scrapers = new Map<string, IScraper>();
  const files = fs.readdirSync(SCRAPERS_DIR)
    .filter((f) => f.endsWith(".scraper.ts") || f.endsWith(".scraper.js"));

  for (const file of files) {
    try {
      const mod = require(path.join(SCRAPERS_DIR, file));
      for (const exportName of Object.keys(mod)) {
        const instance = mod[exportName];
        if (instance?.name && typeof instance.scrape === "function" && typeof instance.canScrape === "function") {
          scrapers.set(instance.name, instance);
          logger.warn(`Discovered scraper: ${instance.name}`);
        }
      }
    } catch (err) {
      logger.warn(`Failed to load scraper ${file}`, { error: (err as Error).message });
    }
  }

  return scrapers;
}
