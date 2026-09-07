import { Logger } from "../../domain/interfaces";
import { IScraper, ScraperOptions } from "./interfaces/scraper.interface";
import { Place } from "../../domain/entities";

export abstract class BaseScraper implements IScraper {
  abstract readonly name: string;
  abstract readonly description: string;

  constructor(protected readonly logger: Logger) {}

  async canScrape(): Promise<boolean> {
    return true;
  }

  abstract scrape(options?: ScraperOptions): AsyncGenerator<Place, void, undefined>;

  protected async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const robotsUrl = new URL("/robots.txt", url).href;
      const res = await fetch(robotsUrl);
      const text = await res.text();
      return !text.includes("Disallow: /");
    } catch {
      return true;
    }
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
