import { Place } from "../../entities";

export interface SearchContext {
  query: string;
  normalizedQuery: string;
  lat?: number;
  lng?: number;
  city?: string;
}

export interface RankedPlace {
  place: Place;
  score: number;
}

export interface IRankingStrategy {
  readonly name: string;
  rank(places: Place[], context: SearchContext): RankedPlace[];
}
