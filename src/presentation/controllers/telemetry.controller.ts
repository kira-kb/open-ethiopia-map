import { Request, Response, NextFunction } from "express";
import { IngestTelemetryUseCase } from "../../application/use-cases/ingest-telemetry.use-case";
import { DriverTelemetryRequestSchema } from "../dto/telemetry.dto";
import { Logger } from "../../domain/interfaces";

export class TelemetryController {
  constructor(
    private readonly ingestTelemetryUseCase: IngestTelemetryUseCase,
    private readonly logger?: Logger,
  ) {}

  async ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = DriverTelemetryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: "Invalid telemetry payload",
          details: parsed.error.issues,
        });
        return;
      }

      const result = await this.ingestTelemetryUseCase.execute(parsed.data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
