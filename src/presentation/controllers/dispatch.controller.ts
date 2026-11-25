import { Request, Response } from "express";
import { DispatchNearbyUseCase } from "../../application/use-cases/dispatch-nearby.use-case";
import { DispatchNearbyRequestSchema } from "../dto/dispatch.dto";
import { Logger } from "../../domain/interfaces";
import { EthiopianTranslator } from "../../domain/services/localization/ethiopian-translator";

export class DispatchController {
  constructor(
    private readonly dispatchNearbyUseCase: DispatchNearbyUseCase,
    private readonly logger?: Logger
  ) {}

  public async findNearby(req: Request, res: Response): Promise<void> {
    try {
      const parsed = DispatchNearbyRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid dispatch request",
          details: parsed.error.issues,
        });
        return;
      }

      const lang = EthiopianTranslator.resolveLanguage(req);
      const result = await this.dispatchNearbyUseCase.execute(parsed.data);

      const localizedCandidates = result.candidates.map((c) => ({
        ...c,
        vehicleLabel: EthiopianTranslator.translateVehicle(c.vehicleType, lang),
        etaText: EthiopianTranslator.formatDuration(c.roadDurationSeconds, lang),
        roadDistanceText: EthiopianTranslator.formatDistance(c.roadDistanceMeters, lang),
      }));

      res.json({
        ...result,
        lang,
        candidates: localizedCandidates,
      });
    } catch (err) {
      this.logger?.error("Failed to find nearby dispatch candidates", {
        error: (err as Error).message,
      });
      res.status(500).json({
        error: "Failed to dispatch nearby drivers",
        message: (err as Error).message,
      });
    }
  }
}
