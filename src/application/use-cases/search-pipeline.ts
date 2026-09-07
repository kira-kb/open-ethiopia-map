import { ISearchSource, SearchSourceQuery } from "../../domain/interfaces/search-source.interface";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { RankingPipeline, RankingPipelineContext } from "../../domain/services/ranking/ranking-pipeline";
import { ICache, Logger } from "../../domain/interfaces";
import { config } from "../../infrastructure/config";

export interface SearchPipelineMeta {
  sources: string[];
  cached: boolean;
}

export class SearchPipeline {
  private ranking = new RankingPipeline();

  constructor(
    private readonly sources: ISearchSource[],
    private readonly cache: ICache,
    private readonly logger: Logger,
  ) {}

  async execute(query: SearchSourceQuery): Promise<{
    results: SearchResult[];
    meta: SearchPipelineMeta;
  }> {
    const context: RankingPipelineContext = {
      query: query.query,
      normalizedQuery: query.query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      lat: query.lat,
      lng: query.lng,
      city: query.city,
    };

    if (context.normalizedQuery.length < config.search.minQueryLength) {
      return { results: [], meta: { sources: [], cached: false } };
    }

    const sortedSources = [...this.sources].sort((a, b) => b.priority - a.priority);
    const allResults: SearchResult[][] = [];
    const usedSources: string[] = [];

    for (const source of sortedSources) {
      try {
        const results = await source.search(query);
        if (results.length > 0) {
          usedSources.push(source.constructor.name.replace("Source", "").replace(/([A-Z])/g, " $1").trim().toUpperCase());
        }
        allResults.push(results);
      } catch (err) {
        this.logger.warn(`Search source failed`, {
          source: source.constructor.name,
          error: (err as Error).message,
        });
      }
    }

    const results = this.ranking.execute(allResults, context, query.limit);

    return {
      results,
      meta: { sources: usedSources, cached: false },
    };
  }

  async executeCached(query: SearchSourceQuery): Promise<{
    results: SearchResult[];
    meta: SearchPipelineMeta;
  }> {
    const userSegment = query.userId ? `user:${query.userId}:` : "";
    const cacheKey = `search:${userSegment}autocomplete:${query.query}:${query.limit}:${query.city || ""}:${query.lat?.toFixed(2) || ""}:${query.lng?.toFixed(2) || ""}`;

    const cached = await this.cache.get<{ results: SearchResult[]; meta: SearchPipelineMeta }>(cacheKey);
    if (cached) {
      return { ...cached, meta: { ...cached.meta, cached: true } };
    }

    const result = await this.execute(query);
    await this.cache.set(cacheKey, result, config.cache.ttl.autocomplete);
    return result;
  }

  async invalidateUserCachePattern(userId: string): Promise<number> {
    const pattern = `search:user:${userId}:autocomplete:*`;
    return this.cache.delPattern(pattern);
  }
}
