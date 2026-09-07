import { ISearchSource, SearchSourceQuery } from "../../domain/interfaces/search-source.interface";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { IPlaceRepository } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { LocationType } from "../../domain/entities";

export class PackManLocationsSource implements ISearchSource {
  readonly priority = 75;

  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly logger: Logger,
  ) {}

  async search(query: SearchSourceQuery): Promise<SearchResult[]> {
    try {
      const dbResults = await this.placeRepo.search({
        query: query.query,
        limit: query.limit,
        city: query.city,
        lat: query.lat,
        lng: query.lng,
      });

      return dbResults.map((place) => {
        const lt = place.locationType;
        const locationTypeOptions = lt
          ? [lt, ...Object.values(LocationType).filter((t) => t !== lt)]
          : undefined;

        return {
          id: place.id || "",
          title: place.displayName || place.name,
          subtitle: place.address
            ? [place.address.street, place.address.city, place.address.country]
                .filter(Boolean)
                .join(", ")
            : place.formattedAddress || undefined,
          latitude: place.latitude,
          longitude: place.longitude,
          locationType: lt || undefined,
          source: "PACKMAN" as const,
          score: place.confidence || 0.5,
          rawScore: place.confidence || 0.5,
          extraFields: undefined,
          locationTypeOptions,
          isSavedPlace: false,
          placeId: place.id,
          address: place.address
            ? [place.address.street, place.address.city, place.address.country]
                .filter(Boolean)
                .join(", ")
            : place.formattedAddress || undefined,
          city: place.address?.city,
        };
      });
    } catch (err) {
      this.logger.warn("PackManLocationsSource search failed", { error: (err as Error).message });
      return [];
    }
  }
}
