import { Request, Response, NextFunction } from "express";
import { SearchPlacesUseCase } from "../../application/use-cases";
import { AutocompleteQuerySchema, AutocompleteResponseDto } from "../dto";
import { errorResponse } from "../dto";
import { SearchResult } from "../../domain/entities";

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

function mapBadge(result: SearchResult): BadgeConfig {
  const sourceBadge = SOURCE_BADGE_MAP[result.source];
  if (sourceBadge) return sourceBadge;

  // Fallback: use source name as badge
  return { badge: result.source?.replace(/_/g, " ") || "Map", icon: "map-pin" };
}

export class AutocompleteController {
  constructor(private readonly searchPlaces: SearchPlacesUseCase) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = AutocompleteQuerySchema.parse(req.query);
      const start = Date.now();

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
            const { badge, icon } = mapBadge(r);
            return {
              id: r.placeId || r.id,
              name: r.title,
              address: r.subtitle,
              latitude: r.latitude,
              longitude: r.longitude,
              city: r.city,
              source: r.source,
              confidence: r.score,
              recommendedName: r.title,
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
