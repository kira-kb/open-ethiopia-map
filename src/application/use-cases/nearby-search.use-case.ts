import { IPlaceRepository, ICache, Logger } from "../../domain/interfaces";
import { Place } from "../../domain/entities";
import { config } from "../../infrastructure/config";

export interface NearbySearchQuery {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  limit?: number;
}

export class NearbySearchUseCase {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly cache: ICache,
    private readonly logger: Logger,
  ) {}

  async execute(query: NearbySearchQuery): Promise<Place[]> {
    const radius = query.radius || 500;
    const limit = Math.min(query.limit || 20, 50);
    const cacheKey = `nearby:${query.lat.toFixed(2)}:${query.lng.toFixed(2)}:${radius}:${query.category || "all"}`;

    const cached = await this.cache.get<Place[]>(cacheKey);
    if (cached) return cached;

    const results = await this.placeRepo.findNearby({
      latitude: query.lat,
      longitude: query.lng,
      radiusMeters: radius,
      limit,
      category: query.category,
    });

    await this.cache.set(cacheKey, results, config.cache.ttl.nearby);
    return results;
  }
}
