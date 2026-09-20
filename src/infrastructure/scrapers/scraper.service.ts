import { randomUUID } from "crypto";
import { IScraper, ScraperOptions } from "./interfaces/scraper.interface";
import { IPlaceRepository, Logger } from "../../domain/interfaces";
import { Place, PlaceSource } from "../../domain/entities";
import { EthiopiaPoiScraper } from "./ethiopia-poi.scraper";
import { ShoppingMallScraper } from "./shopping-mall.scraper";

export interface ScraperRunResult {
  id: string;
  scraperName: string;
  category?: string;
  city?: string;
  placesFound: number;
  placesSaved: number;
  placesUpdated: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  status: "completed" | "failed";
  error?: string;
}

export class ScraperService {
  private scrapers = new Map<string, IScraper>();
  private runHistory: ScraperRunResult[] = [];

  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly logger: Logger,
  ) {
    this.register(new EthiopiaPoiScraper(logger));
    this.register(new ShoppingMallScraper(logger));
  }

  register(scraper: IScraper): void {
    this.scrapers.set(scraper.name, scraper);
    this.logger.info(`Registered scraper: ${scraper.name}`);
  }

  list(): Array<{
    name: string;
    description: string;
    supportedCategories: string[];
    supportedCities: string[];
  }> {
    const list: Array<{
      name: string;
      description: string;
      supportedCategories: string[];
      supportedCities: string[];
    }> = [];

    for (const [name, scraper] of this.scrapers) {
      list.push({
        name,
        description: scraper.description,
        supportedCategories: [
          "hospital",
          "pharmacy",
          "bank",
          "mall",
          "hotel",
          "restaurant",
          "fuel",
          "transit",
          "university",
          "landmark",
        ],
        supportedCities: [
          "Addis Ababa",
          "Hawassa",
          "Dire Dawa",
          "Bahir Dar",
          "Adama",
          "Bishoftu",
        ],
      });
    }

    return list;
  }

  async run(options?: ScraperOptions & { scraper?: string }): Promise<ScraperRunResult> {
    const scraperName = options?.scraper || "ethiopia-poi";
    const scraper = this.scrapers.get(scraperName);
    if (!scraper) {
      throw new Error(`Scraper not found: ${scraperName}. Available: ${[...this.scrapers.keys()].join(", ")}`);
    }

    const runId = randomUUID();
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    this.logger.info(`Starting scraper run ${runId} for ${scraperName}`, {
      category: options?.category,
      city: options?.city,
      limit: options?.limit,
    });

    let placesFound = 0;
    let placesSaved = 0;
    let placesUpdated = 0;

    try {
      for await (const place of scraper.scrape(options)) {
        placesFound++;

        try {
          // Check for nearby duplicate within 25 meters
          const existing = await this.placeRepo.findByCoordinates(
            place.latitude,
            place.longitude,
            25,
          );

          if (existing) {
            // Merge aliases and augment missing fields
            const combinedAliases = [
              ...new Set([...existing.aliases, ...place.aliases]),
            ];

            const updated = new Place({
              ...existing.toPlain(),
              aliases: combinedAliases,
              formattedAddress: existing.formattedAddress || place.formattedAddress,
              subcity: existing.subcity || place.subcity,
              city: existing.city || place.city,
              category: existing.category || place.category,
              locationType: existing.locationType || place.locationType,
              verified: existing.verified || place.verified,
              confidence: Math.max(existing.confidence, place.confidence),
              metadata: {
                ...((existing.metadata as Record<string, unknown>) || {}),
                lastScrapedAt: new Date().toISOString(),
                scraper: scraperName,
              },
            });

            await this.placeRepo.save(updated);
            placesUpdated++;
          } else {
            await this.placeRepo.save(place);
            placesSaved++;
          }
        } catch (err) {
          this.logger.warn(`Failed to store scraped place "${place.name}"`, {
            error: (err as Error).message,
          });
        }
      }

      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;

      const result: ScraperRunResult = {
        id: runId,
        scraperName,
        category: options?.category,
        city: options?.city,
        placesFound,
        placesSaved,
        placesUpdated,
        durationMs,
        startedAt,
        finishedAt,
        status: "completed",
      };

      this.runHistory.unshift(result);
      if (this.runHistory.length > 50) this.runHistory.pop();

      this.logger.info(`Scraper run ${runId} completed successfully`, {
        placesFound,
        placesSaved,
        placesUpdated,
        durationMs,
      });

      return result;
    } catch (err) {
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;

      const failedResult: ScraperRunResult = {
        id: runId,
        scraperName,
        category: options?.category,
        city: options?.city,
        placesFound,
        placesSaved,
        placesUpdated,
        durationMs,
        startedAt,
        finishedAt,
        status: "failed",
        error: (err as Error).message,
      };

      this.runHistory.unshift(failedResult);
      if (this.runHistory.length > 50) this.runHistory.pop();

      throw err;
    }
  }

  getHistory(): ScraperRunResult[] {
    return this.runHistory;
  }
}
