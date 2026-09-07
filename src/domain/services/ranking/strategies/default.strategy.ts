import { Place } from "../../../entities";
import { IRankingStrategy, RankedPlace, SearchContext } from "../ranking-strategy.interface";

export class DefaultRankingStrategy implements IRankingStrategy {
  readonly name = "default";

  rank(places: Place[], context: SearchContext): RankedPlace[] {
    const q = context.normalizedQuery.toLowerCase();
    return places
      .map((place) => {
        const name = place.normalizedName.toLowerCase();
        const exact = name === q ? 1 : 0;
        const prefix = name.startsWith(q) ? 0.5 : 0;
        const score = exact + prefix + place.confidence * 0.3;
        return { place, score: Math.min(score, 1) };
      })
      .filter((r) => r.score > 0.2)
      .sort((a, b) => b.score - a.score);
  }
}
