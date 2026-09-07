import { IPlaceRepository, IGeocodeProvider, ICache, Logger, IMetricsRegistry, IEventBus } from "../../domain/interfaces";
import { Coordinates } from "../../domain/value-objects";
import { PackManAddress, Place } from "../../domain/entities";
import { config } from "../../infrastructure/config";

export interface ReverseGeocodeQuery {
  lat: number;
  lng: number;
  radius?: number;
}

export interface ReverseGeocodeResult {
  address: PackManAddress;
  nearbyPlaces?: Place[];
  source: string;
}

export class ReverseGeocodeUseCase {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly geocodeProvider: IGeocodeProvider,
    private readonly cache: ICache,
    private readonly logger: Logger,
    private readonly metrics: IMetricsRegistry,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(query: ReverseGeocodeQuery): Promise<ReverseGeocodeResult> {
    const coords = new Coordinates(query.lat, query.lng);
    const radius = query.radius || config.search.reverseRadius;
    const cacheKey = `reverse:${coords.toKey()}:${radius}`;

    const cached = await this.cache.get<ReverseGeocodeResult>(cacheKey);
    if (cached) return cached;

    const nearbyPlace = await this.placeRepo.findByCoordinates(query.lat, query.lng, radius);

    if (nearbyPlace) {
      const address = PackManAddress.fromComponents({
        city: nearbyPlace.address.city,
        subcity: nearbyPlace.address.subcity,
        region: nearbyPlace.address.region,
        country: nearbyPlace.address.country,
        street: nearbyPlace.address.street,
        building: nearbyPlace.address.building,
      });

      const result: ReverseGeocodeResult = {
        address,
        nearbyPlaces: [nearbyPlace],
        source: "database",
      };

      await this.cache.set(cacheKey, result, config.cache.ttl.reverse);
      return result;
    }

    try {
      const response = await this.geocodeProvider.reverseGeocode({
        coordinates: coords,
        radius,
      });

      const result: ReverseGeocodeResult = {
        address: response.address,
        nearbyPlaces: response.nearbyPlaces,
        source: this.geocodeProvider.name,
      };

      await this.cache.set(cacheKey, result, config.cache.ttl.reverse);

      if (response.nearbyPlaces?.length) {
        this.saveHighConfidencePlaces(response.nearbyPlaces).catch(() => {});
      }

      return result;
    } catch (err) {
      this.logger.warn("Reverse geocode failed", { error: (err as Error).message });
      return {
        address: PackManAddress.fromComponents({}),
        source: "fallback",
      };
    }
  }

  private async saveHighConfidencePlaces(places: Place[]): Promise<void> {
    const highConfidence = places.filter((p) => p.confidence >= config.search.confidenceThreshold);
    if (highConfidence.length === 0) return;
    try {
      await this.placeRepo.upsertMany(highConfidence);
    } catch (err) {
      this.logger.warn("Failed to save reverse-geocode places", {
        error: (err as Error).message,
      });
    }
  }
}
