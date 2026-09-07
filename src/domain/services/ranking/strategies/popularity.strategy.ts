import { Place } from "../../../entities";
import { IRankingStrategy, RankedPlace, SearchContext } from "../ranking-strategy.interface";

export class PopularityRankingStrategy implements IRankingStrategy {
  readonly name = "popularity";

  rank(places: Place[], context: SearchContext): RankedPlace[] {
    const q = context.normalizedQuery.toLowerCase();
    const maxSearchCount = Math.max(...places.map((p) => p.searchCount), 1);

    return places
      .map((place) => {
        const name = place.normalizedName.toLowerCase();
        const exact = name === q ? 1 : 0;
        const prefix = name.startsWith(q) ? 0.5 : 0;
        const popularity = (place.searchCount / maxSearchCount) * 0.5 + place.popularity * 0.3;
        const score = exact + prefix + popularity;
        return { place, score: Math.min(score, 1) };
      })
      .filter((r) => r.score > 0.2)
      .sort((a, b) => b.score - a.score);
  }
}
