import { ISearchSource, SearchSourceQuery } from "../../domain/interfaces/search-source.interface";
import { SearchResult } from "../../domain/entities/search-result.entity";
import { IPlaceRepository } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";

type MatchField = "label" | "alias" | "address" | "street" | "building" | "landmark";

export class SavedPlacesSource implements ISearchSource {
  readonly priority = 100;

  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly logger: Logger,
  ) {}

  async search(query: SearchSourceQuery): Promise<SearchResult[]> {
    if (!query.userId) return [];

    try {
      const savedPlaces = await this.placeRepo.findSavedPlaces(query.userId);
      const q = query.query.toLowerCase();

      return savedPlaces
        .flatMap((sp) => {
          const results: Array<SearchResult & { _matchField?: MatchField }> = [];

          const base = {
            id: sp.id,
            title: sp.label,
            subtitle: sp.name || sp.address || undefined,
            latitude: sp.latitude,
            longitude: sp.longitude,
            locationType: sp.locationType || undefined,
            source: "SAVED_PLACE" as const,
            score: 1.5,
            rawScore: 1.5,
            extraFields: undefined as undefined,
            locationTypeOptions: undefined,
            savedLabel: sp.label,
            isSavedPlace: true,
            placeId: sp.id,
            address: sp.address,
            city: sp.city,
            locationHash: undefined,
          };

          if (!q || q.length < 2) {
            results.push({ ...base, _matchField: "label" });
            return results;
          }

          if (sp.label.toLowerCase().includes(q)) {
            results.push({ ...base, _matchField: "label" });
            return results;
          }

          if ((sp.name || "").toLowerCase().includes(q)) {
            results.push({ ...base, _matchField: "alias" });
            return results;
          }

          if ((sp.address || "").toLowerCase().includes(q)) {
            results.push({ ...base, _matchField: "address" });
            return results;
          }

          return results;
        })
        .map(({ _matchField, ...rest }) => rest);
    } catch (err) {
      this.logger.warn("SavedPlacesSource search failed", { error: (err as Error).message });
      return [];
    }
  }
}
