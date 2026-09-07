import { Place } from "../../../entities";
import { IRankingStrategy, RankedPlace, SearchContext } from "../ranking-strategy.interface";

export class HybridRankingStrategy implements IRankingStrategy {
  readonly name = "hybrid";

  rank(places: Place[], context: SearchContext): RankedPlace[] {
    const q = context.normalizedQuery.toLowerCase();
    const maxPopularity = Math.max(...places.map((p) => p.popularity), 1);
    const maxDistance = 50000;

    return places
      .map((place) => {
        const name = place.normalizedName.toLowerCase();
        const aliases = place.aliases.map((a) => a.toLowerCase());

        const exactMatch = name === q || aliases.includes(q) ? 1 : 0;
        const prefixMatch = name.startsWith(q) || aliases.some((a) => a.startsWith(q)) ? 1 : 0;
        const fuzzyScore = this.trigramScore(name, q);
        const confidence = place.confidence;
        const searchCount = Math.log10(1 + place.searchCount) / 4;
        const selectionCount = Math.log10(1 + place.selectionCount) / 4;
        const popularity = place.popularity / maxPopularity;
        const verified = place.verified ? 1 : 0;
        const recommendationConfidence = place.recommendationConfidence;
        const distance = context.lat != null && context.lng != null
          ? 1 - Math.min(this.haversine(context.lat, context.lng, place.latitude, place.longitude), maxDistance) / maxDistance
          : 0.5;

        const score =
          exactMatch * 0.25 +
          prefixMatch * 0.125 +
          fuzzyScore * 0.08 +
          confidence * 0.10 +
          searchCount * 0.05 +
          selectionCount * 0.05 +
          popularity * 0.08 +
          verified * 0.05 +
          recommendationConfidence * 0.10 +
          distance * 0.04;

        return { place, score };
      })
      .filter((r) => r.score > 0.1)
      .sort((a, b) => b.score - a.score);
  }

  private trigramScore(a: string, b: string): number {
    if (a.length < 3 || b.length < 3) {
      return a.includes(b) || b.includes(a) ? 0.5 : 0;
    }
    const trigramsA = this.trigrams(a);
    const trigramsB = this.trigrams(b);
    const intersection = Array.from(trigramsA).filter((t: string) => trigramsB.has(t)).length;
    const union = new Set([...trigramsA, ...trigramsB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private trigrams(s: string): Set<string> {
    const result = new Set<string>();
    for (let i = 0; i <= s.length - 3; i++) {
      result.add(s.substring(i, i + 3));
    }
    return result;
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
