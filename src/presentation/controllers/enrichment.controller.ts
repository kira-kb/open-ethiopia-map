import { Request, Response, NextFunction } from "express";
import { IPlaceRepository, IRecommendationCache, IEventBus } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { ILocationEnrichmentRepository } from "../../domain/entities/location-enrichment-repository.interface";
import { SaveLocationEnrichmentSchema, SaveLocationEnrichmentResponseDto } from "../dto/enrichment.dto";
import { LocationEnriched } from "../../domain/events";
import { LocationEnrichment, EnrichmentExtraDetails } from "../../domain/entities/location-enrichment.entity";
import { errorResponse } from "../dto";

function makeCoordHash(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat}:${roundedLng}`;
}

export class EnrichmentController {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly enrichmentRepo: ILocationEnrichmentRepository,
    private readonly recommendationCache?: IRecommendationCache,
    private readonly eventBus?: IEventBus,
    private readonly logger?: Logger,
    private readonly invalidateUserCache?: (userId: string) => Promise<number>,
  ) {}

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = SaveLocationEnrichmentSchema.parse(req.body);
      const { placeId, locationId, finalName, suggestedName, latitude, longitude, locationType, extraDetails, isEdit, userId, sourceProvider, savePlace, savedLabel } = parsed;

      const coordHash = makeCoordHash(latitude, longitude);

      const enrichment = new LocationEnrichment({
        placeId,
        locationId,
        userId,
        suggestedName: suggestedName || undefined,
        finalName,
        locationType: locationType || undefined,
        extraDetails: (extraDetails || {}) as EnrichmentExtraDetails,
        latitude,
        longitude,
        coordHash,
        savePlace,
        savedLabel,
        sourceProvider,
      });
      const saved = await this.enrichmentRepo.save(enrichment);
      this.logger?.info("Location enrichment saved", { enrichmentId: saved.id, coordHash });

      // Update recommendation cache with accepted name (no confidence boost)
      if (this.recommendationCache) {
        await this.recommendationCache.recordEnrichment(coordHash, finalName, isEdit);
      }

      // Save as user's saved place if requested
      let savedPlaceId: string | undefined;
      if (savePlace && savedLabel && userId) {
        try {
          const savedPlace = await this.placeRepo.saveSavedPlace({
            userId,
            label: savedLabel,
            name: finalName,
            address: undefined,
            latitude,
            longitude,
            locationType: locationType as any,
            extraDetails: extraDetails as Record<string, unknown>,
            isDefault: false,
          });
          savedPlaceId = savedPlace.id;
        } catch (err) {
          this.logger?.warn("Failed to save place for user", { userId, error: (err as Error).message });
        }
      }

      // Invalidate user's autocomplete cache (saved place or enrichment may change results)
      if (this.invalidateUserCache && userId) {
        await this.invalidateUserCache(userId).catch(() => {});
      }

      // Publish enrichment event (not a confirmation — confidence not affected)
      if (this.eventBus) {
        await this.eventBus.publish(new LocationEnriched(placeId || locationId || "", coordHash, finalName, userId));
      }

      const response: SaveLocationEnrichmentResponseDto = {
        success: true,
        data: {
          message: "Location details saved",
          enrichmentId: saved.id,
          savedPlaceId,
        },
      };

      res.json(response);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid location enrichment data", err));
        return;
      }
      next(err);
    }
  }
}
