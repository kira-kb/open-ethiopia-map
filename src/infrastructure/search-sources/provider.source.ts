import { ISearchSource, SearchSourceQuery } from "../../domain/interfaces/search-source.interface";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { IGeocodeProvider, Logger } from "../../domain/interfaces";
import { Place, LocationType, LOCATION_TYPE_EXTRA_FIELDS } from "../../domain/entities";

export class ProviderSource implements ISearchSource {
  readonly priority = 25;

  constructor(
    private readonly geocodeProvider: IGeocodeProvider,
    private readonly logger?: Logger,
  ) {}

  async search(query: SearchSourceQuery): Promise<SearchResult[]> {
    try {
      const results = await this.geocodeProvider.autocomplete({
        query: query.query,
        limit: query.limit,
        lat: query.lat,
        lng: query.lng,
        city: query.city,
      });

      // Read-only: no writes to DB.
      // High-confidence place ingestion is handled asynchronously
      // by the CacheWarmWorker listening to SearchPerformed events.

      return results.map((place: Place) => {
        const locationType = place.locationType;
        const extraFields = locationType ? LOCATION_TYPE_EXTRA_FIELDS[locationType] || [] : [];

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
          locationType: locationType || undefined,
          source: "PROVIDER" as const,
          score: place.confidence || 0.3,
          rawScore: place.confidence || 0.3,
          extraFields: extraFields.map((f) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            optional: f.optional,
            reason: (f as { reason?: string }).reason,
          })),
          locationTypeOptions: locationType
            ? [locationType, ...Object.values(LocationType).filter((t) => t !== locationType)]
            : undefined,
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
      this.logger?.warn("ProviderSource search failed", { error: (err as Error).message });
      return [];
    }
  }
}
