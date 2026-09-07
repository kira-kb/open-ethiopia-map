import { ISearchSource, SearchSourceQuery } from "../../domain/interfaces/search-source.interface";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { IRecommendationCache } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";

export class RecommendationSource implements ISearchSource {
  readonly priority = 50;

  constructor(
    private readonly recommendationCache: IRecommendationCache,
    private readonly logger: Logger,
  ) {}

  async search(query: SearchSourceQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      if (!query.lat || !query.lng) return results;

      const nearby = await this.recommendationCache.findNearby(query.lat, query.lng, 100);
      const q = query.query.toLowerCase();

      for (const rec of nearby) {
        const matchesName =
          rec.recommendedName.toLowerCase().includes(q) ||
          rec.acceptedNames.some((n) => n.toLowerCase().includes(q));

        if (matchesName) {
          results.push({
            id: rec.coordHash,
            title: rec.recommendedName,
            subtitle: rec.locationType
              ? `${rec.locationType.replace(/_/g, " ")}`
              : undefined,
            latitude: rec.latitude,
            longitude: rec.longitude,
            locationType: rec.locationType || undefined,
            source: "RECOMMENDATION" as const,
            score: rec.enrichmentCount > 0 ? 0.9 : 0.6,
            rawScore: rec.enrichmentCount > 0 ? 0.9 : 0.6,
            placeId: rec.coordHash,
          });
        }
      }

      return results;
    } catch (err) {
      this.logger.warn("RecommendationSource search failed", { error: (err as Error).message });
      return [];
    }
  }
}
