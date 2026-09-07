import {
  Logger,
  IMetricsRegistry,
  IEventBus,
} from "../../domain/interfaces";
import { SearchPipeline } from "./search-pipeline";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { SearchPerformed } from "../../domain/events";
import { config } from "../../infrastructure/config";

export interface SearchPlacesQuery {
  query: string;
  limit?: number;
  lat?: number;
  lng?: number;
  city?: string;
  categories?: string;
  userId?: string;
}

export interface SearchPlacesResult {
  places: SearchResult[];
  total: number;
  sources: string[];
  cached: boolean;
}

export class SearchPlacesUseCase {
  constructor(
    private readonly pipeline: SearchPipeline,
    private readonly logger: Logger,
    private readonly metrics: IMetricsRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(query: SearchPlacesQuery): Promise<SearchPlacesResult> {
    const start = Date.now();
    const limit = Math.min(query.limit || config.search.defaultLimit, config.search.maxLimit);

    const { results, meta } = await this.pipeline.executeCached({
      query: query.query,
      limit,
      lat: query.lat,
      lng: query.lng,
      city: query.city,
      userId: query.userId,
    });

    const responseTimeMs = Date.now() - start;

    await this.eventBus.publish(new SearchPerformed(
      query.query,
      results.length,
      "pipeline",
      responseTimeMs,
    ));

    return {
      places: results,
      total: results.length,
      sources: meta.sources,
      cached: meta.cached,
    };
  }

  async invalidateUserCache(userId: string): Promise<number> {
    return this.pipeline.invalidateUserCachePattern(userId);
  }
}
