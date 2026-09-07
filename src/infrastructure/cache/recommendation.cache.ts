import { IRecommendationCache, CachedRecommendation } from "../../domain/interfaces/recommendation-cache.interface";
import { ICache, Logger } from "../../domain/interfaces";
import { LocationType } from "../../domain/entities/location.entity";
import { config } from "../config";

function makeCoordHash(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat}:${roundedLng}`;
}

export class RecommendationCache implements IRecommendationCache {
  private readonly cachePrefix = "recommendation:";
  private readonly indexPrefix = "recommendation:index:";

  constructor(
    private readonly cache: ICache,
    private readonly logger: Logger,
  ) {}

  private key(hash: string): string {
    return `${this.cachePrefix}${hash}`;
  }

  async get(hash: string): Promise<CachedRecommendation | null> {
    try {
      return await this.cache.get<CachedRecommendation>(this.key(hash));
    } catch (err) {
      this.logger.warn("Recommendation cache get failed", { hash, error: (err as Error).message });
      return null;
    }
  }

  async set(rec: CachedRecommendation): Promise<void> {
    try {
      const hash = rec.coordHash || makeCoordHash(rec.latitude, rec.longitude);
      const entry: CachedRecommendation = { ...rec, coordHash: hash };
      await this.cache.set(this.key(hash), entry, config.cache.ttl.recommendation);
      await this.cache.set(
        `${this.indexPrefix}${hash}`,
        `${rec.latitude},${rec.longitude}`,
        config.cache.ttl.recommendation,
      );
    } catch (err) {
      this.logger.warn("Recommendation cache set failed", { error: (err as Error).message });
    }
  }

  async recordEnrichment(hash: string, acceptedName: string, isEdit: boolean): Promise<void> {
    try {
      const existing = await this.get(hash);
      if (existing) {
        const acceptedNames = existing.acceptedNames.includes(acceptedName)
          ? existing.acceptedNames
          : [...existing.acceptedNames, acceptedName];
        await this.set({
          ...existing,
          acceptedNames,
          enrichmentCount: existing.enrichmentCount + 1,
          recommendedName: isEdit ? acceptedName : existing.recommendedName,
          lastUsedAt: new Date(),
        });
      }
    } catch (err) {
      this.logger.warn("Recommendation cache recordEnrichment failed", {
        hash,
        error: (err as Error).message,
      });
    }
  }

  async recordDelivery(hash: string): Promise<void> {
    try {
      const existing = await this.get(hash);
      if (existing) {
        await this.set({
          ...existing,
          deliveryCount: existing.deliveryCount + 1,
          lastUsedAt: new Date(),
        });
      }
    } catch (err) {
      this.logger.warn("Recommendation cache recordDelivery failed", {
        hash,
        error: (err as Error).message,
      });
    }
  }

  async findNearby(lat: number, lng: number, radiusMeters = 100): Promise<CachedRecommendation[]> {
    try {
      const results: CachedRecommendation[] = [];
      const step = 0.001;
      const latStep = step;
      const lngStep = step / Math.cos((lat * Math.PI) / 180);

      for (let dLat = -radiusMeters / 111000; dLat <= radiusMeters / 111000; dLat += latStep) {
        for (let dLng = -radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180)); dLng <= radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180)); dLng += lngStep) {
          const hash = makeCoordHash(lat + dLat, lng + dLng);
          const entry = await this.get(hash);
          if (entry) {
            results.push(entry);
          }
        }
      }

      return results;
    } catch (err) {
      this.logger.warn("Recommendation cache findNearby failed", {
        error: (err as Error).message,
      });
      return [];
    }
  }
}
