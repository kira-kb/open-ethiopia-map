import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { IPlaceRepository, SavedPlaceRecord } from "../../domain/interfaces";
import { Logger } from "../../domain/interfaces";
import { errorResponse } from "../dto";

export const CreateSavedPlaceSchema = z.object({
  userId: z.string().min(1),
  label: z.string().min(1),
  name: z.string().optional(),
  address: z.string().optional(),
  locationType: z.string().optional(),
  extraDetails: z.record(z.string(), z.unknown()).optional(),
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateSavedPlaceSchema = z.object({
  userId: z.string().min(1),
  label: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  locationType: z.string().optional(),
  extraDetails: z.record(z.string(), z.unknown()).optional(),
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export class SavedPlacesController {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly logger?: Logger,
    private readonly invalidateUserCache?: (userId: string) => Promise<number>,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateSavedPlaceSchema.parse(req.body);
      const created = await this.placeRepo.saveSavedPlace(parsed as any);
      this.logger?.info("Saved place created", { placeId: created.id, userId: parsed.userId });

      if (this.invalidateUserCache) {
        await this.invalidateUserCache(parsed.userId).catch(() => {});
      }

      res.status(201).json({ success: true, data: { place: created } });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid saved place data", err));
        return;
      }
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.query.userId || "");
      if (!userId) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "userId query parameter is required"));
        return;
      }

      const savedPlaces = await this.placeRepo.findSavedPlaces(userId);
      res.json({ success: true, data: { places: savedPlaces } });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id || "");
      const parsed = UpdateSavedPlaceSchema.parse(req.body);
      const { userId, ...data } = parsed;

      const updated = await this.placeRepo.updateSavedPlace(userId, id, data as any);
      this.logger?.info("Saved place updated", { placeId: id, userId });

      if (this.invalidateUserCache) {
        await this.invalidateUserCache(userId).catch(() => {});
      }

      res.json({ success: true, data: { place: updated } });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid saved place data", err));
        return;
      }
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.query.userId || "");
      const id = String(req.params.id || "");

      if (!userId) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "userId query parameter is required"));
        return;
      }

      await this.placeRepo.deleteSavedPlace(userId, id);
      this.logger?.info("Saved place deleted", { placeId: id, userId });

      if (this.invalidateUserCache) {
        await this.invalidateUserCache(userId).catch(() => {});
      }

      res.json({ success: true, data: { message: "Saved place deleted" } });
    } catch (err) {
      next(err);
    }
  }
}
