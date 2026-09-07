import { SearchResult } from "../../entities/search-result.entity";
import { LocationIdentity } from "../../entities/location-identity.entity";

export interface RankingPipelineContext {
  query: string;
  normalizedQuery: string;
  lat?: number;
  lng?: number;
  city?: string;
}

export interface WeightConfig {
  sourceScore: number;
  exactMatchBonus: number;
  prefixMatchBonus: number;
  aliasMatchBonus: number;
  distanceWeight: number;
  popularityWeight: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
  sourceScore: 1.0,
  exactMatchBonus: 0.3,
  prefixMatchBonus: 0.15,
  aliasMatchBonus: 0.1,
  distanceWeight: 0.05,
  popularityWeight: 0.1,
};

function computeDistance(lat1: number, lng1: number, lat2?: number, lng2?: number): number {
  if (lat2 === undefined || lng2 === undefined) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeWeightedScore(
  r: SearchResult,
  context: RankingPipelineContext,
  weights: WeightConfig = DEFAULT_WEIGHTS,
): number {
  const q = context.normalizedQuery.toLowerCase();
  const title = r.title.toLowerCase();

  let score = r.score * weights.sourceScore;

  const exactMatch = title === q;
  const prefixMatch = title.startsWith(q);
  const aliasMatch =
    !exactMatch &&
    !prefixMatch &&
    (r.address?.toLowerCase().includes(q) || r.subtitle?.toLowerCase().includes(q) || false);
  const labelMatch = r.savedLabel?.toLowerCase() === q;

  if (exactMatch || labelMatch) score += weights.exactMatchBonus;
  else if (prefixMatch) score += weights.prefixMatchBonus;
  else if (aliasMatch) score += weights.aliasMatchBonus;

  if (context.lat !== undefined && context.lng !== undefined) {
    const dist = computeDistance(context.lat, context.lng, r.latitude, r.longitude);
    const proximity = Math.max(0, 1 - dist / 20);
    score += proximity * weights.distanceWeight;
  }

  score += r.rawScore ? r.rawScore * weights.popularityWeight : 0;

  return score;
}

function normalize(results: SearchResult[]): SearchResult[] {
  const maxScore = Math.max(...results.map((r) => r.score), 0.001);
  return results.map((r) => ({
    ...r,
    score: +(r.score / maxScore).toFixed(4),
  }));
}

export class RankingPipeline {
  merge(allResults: SearchResult[][]): SearchResult[] {
    const seen = new Map<string, SearchResult>();

    for (const batch of allResults) {
      for (const r of batch) {
        const hash = LocationIdentity.fromSearchResult(r).hash;
        const existing = seen.get(hash);
        if (!existing) {
          seen.set(hash, r);
        } else if (r.source === "SAVED_PLACE" || r.source === "PACKMAN") {
          // Local sources override external duplicates
          seen.set(hash, r);
        }
      }
    }

    return Array.from(seen.values());
  }

  rank(results: SearchResult[], context: RankingPipelineContext): SearchResult[] {
    return results
      .map((r) => ({
        ...r,
        score: computeWeightedScore(r, context),
      }))
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

        const aPrefix = a.title.toLowerCase().startsWith(context.normalizedQuery);
        const bPrefix = b.title.toLowerCase().startsWith(context.normalizedQuery);
        if (aPrefix && !bPrefix) return -1;
        if (!aPrefix && bPrefix) return 1;

        return b.rawScore || 0 - (a.rawScore || 0);
      });
  }

  limit(results: SearchResult[], max: number): SearchResult[] {
    return results.slice(0, max);
  }

  execute(
    allResults: SearchResult[][],
    context: RankingPipelineContext,
    maxResults: number,
  ): SearchResult[] {
    const merged = this.merge(allResults);
    const ranked = this.rank(merged, context);
    const normalized = normalize(ranked);
    return this.limit(normalized, maxResults);
  }
}
