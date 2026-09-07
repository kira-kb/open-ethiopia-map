import { Place } from "../../../domain/entities";

export interface ScraperOptions {
  headless?: boolean;
  maxPages?: number;
  delayMs?: number;
}

export interface IScraper {
  readonly name: string;
  readonly description: string;
  canScrape(): Promise<boolean>;
  scrape(options?: ScraperOptions): AsyncGenerator<Place, void, undefined>;
}
