import { Request, Response, NextFunction } from "express";
import { ScraperService } from "../../infrastructure/scrapers/scraper.service";
import { Logger } from "../../domain/interfaces";

export class ScraperController {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly logger: Logger,
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    const scrapers = this.scraperService.list();
    res.json({
      success: true,
      data: { scrapers },
      meta: { total: scrapers.length },
    });
  }

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scraper, category, city, limit } = req.body || {};
      const result = await this.scraperService.run({
        scraper: scraper ? String(scraper) : undefined,
        category: category ? String(category) : undefined,
        city: city ? String(city) : undefined,
        limit: limit ? Number(limit) : 25,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async status(req: Request, res: Response): Promise<void> {
    const history = this.scraperService.getHistory();
    res.json({
      success: true,
      data: {
        lastRun: history[0] || null,
        history,
      },
      meta: { totalRuns: history.length },
    });
  }
}
