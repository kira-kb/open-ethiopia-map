import { Place } from "../../entities";
import { IRankingStrategy, RankedPlace, SearchContext } from "./ranking-strategy.interface";

export class RankingEngine {
  constructor(private strategy: IRankingStrategy) {}

  setStrategy(strategy: IRankingStrategy): void {
    this.strategy = strategy;
  }

  rank(places: Place[], context: SearchContext): RankedPlace[] {
    return this.strategy.rank(places, context);
  }
}
