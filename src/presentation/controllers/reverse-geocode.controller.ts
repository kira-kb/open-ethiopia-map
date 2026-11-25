import { Request, Response, NextFunction } from "express";
import { ReverseGeocodeUseCase } from "../../application/use-cases";
import { ReverseGeocodeQuerySchema, ReverseGeocodeResponseDto } from "../dto";
import { errorResponse } from "../dto";
import { EthiopianTranslator } from "../../domain/services/localization/ethiopian-translator";

export class ReverseGeocodeController {
  constructor(private readonly reverseGeocode: ReverseGeocodeUseCase) {}

  async lookup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ReverseGeocodeQuerySchema.parse(req.query);
      const lang = EthiopianTranslator.resolveLanguage(req);

      const result = await this.reverseGeocode.execute({
        lat: parsed.lat,
        lng: parsed.lng,
        radius: parsed.radius,
      });

      const street = lang === "am"
        ? EthiopianTranslator.translatePlaceName(result.address.street, "am")
        : result.address.street;
      const subcity = lang === "am"
        ? EthiopianTranslator.translateSubcity(result.address.subcity, "am")
        : result.address.subcity;
      const city = lang === "am"
        ? EthiopianTranslator.translateCity(result.address.city, "am")
        : result.address.city;
      const region = lang === "am"
        ? EthiopianTranslator.translateCity(result.address.region, "am")
        : result.address.region;
      const country = lang === "am" ? "ኢትዮጵያ" : (result.address.country || "Ethiopia");

      const formatted = lang === "am"
        ? EthiopianTranslator.formatAddress({
            street,
            building: result.address.building,
            subcity,
            city,
            country,
          }, "am")
        : (result.address.formatted || `${street ? street + ", " : ""}${subcity ? subcity + ", " : ""}${city || "Addis Ababa"}`);

      const response: ReverseGeocodeResponseDto = {
        success: true,
        data: {
          address: {
            street,
            building: result.address.building,
            city,
            subcity,
            region,
            country,
            postcode: result.address.postcode,
            formatted,
          },
          nearbyPlaces: result.nearbyPlaces?.map((p) => ({
            id: p.id || undefined,
            name: lang === "am" ? EthiopianTranslator.translatePlaceName(p.name, "am") : p.name,
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
