import { Request, Response, NextFunction } from "express";
import { NearbySearchUseCase } from "../../application/use-cases";
import { NearbyQuerySchema } from "../dto";
import { errorResponse } from "../dto";

export class NearbyController {
  constructor(private readonly nearbySearch: NearbySearchUseCase) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = NearbyQuerySchema.parse(req.query);
      const results = await this.nearbySearch.execute({
        lat: parsed.lat,
        lng: parsed.lng,
        radius: parsed.radius,
        category: parsed.category,
        limit: parsed.limit,
      });

      res.json({
        success: true,
        data: {
          places: results.map((p) => ({
            id: p.id,
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
            city: p.address?.city,
            category: p.category,
            source: p.source,
          })),
        },
        meta: { total: results.length },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid query parameters", err));
        return;
      }
      next(err);
    }
  }
}
