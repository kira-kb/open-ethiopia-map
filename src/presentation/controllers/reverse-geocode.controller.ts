import { Request, Response, NextFunction } from "express";
import { ReverseGeocodeUseCase } from "../../application/use-cases";
import { ReverseGeocodeQuerySchema, ReverseGeocodeResponseDto } from "../dto";
import { errorResponse } from "../dto";

export class ReverseGeocodeController {
  constructor(private readonly reverseGeocode: ReverseGeocodeUseCase) {}

  async lookup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ReverseGeocodeQuerySchema.parse(req.query);
      const result = await this.reverseGeocode.execute({
        lat: parsed.lat,
        lng: parsed.lng,
        radius: parsed.radius,
      });

      const response: ReverseGeocodeResponseDto = {
        success: true,
        data: {
          address: {
            street: result.address.street,
            building: result.address.building,
            city: result.address.city,
            subcity: result.address.subcity,
            region: result.address.region,
            country: result.address.country,
            postcode: result.address.postcode,
            formatted: result.address.formatted || "",
          },
          nearbyPlaces: result.nearbyPlaces?.map((p) => ({
            id: p.id || undefined,
            name: p.name,
          })),
          source: result.source,
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
