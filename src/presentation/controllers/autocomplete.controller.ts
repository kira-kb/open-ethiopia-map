import { Request, Response, NextFunction } from "express";
import { SearchPlacesUseCase } from "../../application/use-cases";
import { AutocompleteQuerySchema, AutocompleteResponseDto } from "../dto";
import { errorResponse } from "../dto";
import { SearchResult } from "../../domain/entities";
import { EthiopianTranslator } from "../../domain/services/localization/ethiopian-translator";

// ── Presentation Mapper ─────────────────────────────────────────
// Maps domain SearchResult to DTO with UI decoration (badge, icon)
// Domain layer never knows about these — they are presentation-only

interface BadgeConfig {
  badge: string;
  icon: string;
}

const SOURCE_BADGE_MAP: Record<string, BadgeConfig> = {
  SAVED_PLACE: { badge: "Saved", icon: "star" },
  PACKMAN: { badge: "PackMan Verified", icon: "building" },
  RECOMMENDATION: { badge: "Recommended", icon: "map-pin" },
  PROVIDER: { badge: "Map", icon: "map-pin" },
};

const AMHARIC_BADGE_MAP: Record<string, string> = {
  "Saved": "የተቀመጠ",
  "PackMan Verified": "የተረጋገጠ",
  "Recommended": "የተመከረ",
  "Map": "ካርታ",
};

function mapBadge(result: SearchResult, lang: "en" | "am" = "en"): BadgeConfig {
  const sourceBadge = SOURCE_BADGE_MAP[result.source] || {
    badge: result.source?.replace(/_/g, " ") || "Map",
    icon: "map-pin",
  };

  if (lang === "am") {
    return {
      badge: AMHARIC_BADGE_MAP[sourceBadge.badge] || sourceBadge.badge,
      icon: sourceBadge.icon,
    };
  }

  return sourceBadge;
}

export class AutocompleteController {
  constructor(private readonly searchPlaces: SearchPlacesUseCase) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = AutocompleteQuerySchema.parse(req.query);
      const start = Date.now();
      const lang = EthiopianTranslator.resolveLanguage(req);

      const result = await this.searchPlaces.execute({
        query: parsed.q,
        limit: parsed.limit,
        lat: parsed.lat,
        lng: parsed.lng,
        city: parsed.city,
        categories: parsed.categories,
        userId: parsed.userId,
      });

      const response: AutocompleteResponseDto = {
        success: true,
        data: {
          places: result.places.map((r) => {
            const { badge, icon } = mapBadge(r, lang);
            const localizedName = lang === "am" ? EthiopianTranslator.translatePlaceName(r.title, "am") : r.title;
            const localizedCity = lang === "am" ? EthiopianTranslator.translateCity(r.city, "am") : r.city;
            return {
              id: r.placeId || r.id,
              name: localizedName,
              address: r.subtitle,
              latitude: r.latitude,
              longitude: r.longitude,
              city: localizedCity,
              source: r.source,
              confidence: r.score,
              recommendedName: localizedName,
              locationType: r.locationType,
              locationTypeOptions: r.locationTypeOptions,
              extraFields: r.extraFields,
              isSavedPlace: r.isSavedPlace,
              savedLabel: r.savedLabel,
              badge,
              icon,
            };
          }),
        },
        meta: {
          total: result.total,
          sources: result.sources,
          cached: result.cached,
          processingTime: Date.now() - start,
        },
      };

      res.json(response);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid query parameters", err));
        return;
      }
      next(err);
    }
  }
}
