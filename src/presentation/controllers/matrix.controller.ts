import { Request, Response } from "express";
import { ComputeMatrixUseCase } from "../../application/use-cases/compute-matrix.use-case";
import { MatrixRequestSchema } from "../dto/matrix.dto";
import { Logger } from "../../domain/interfaces";
import { EthiopianTranslator } from "../../domain/services/localization/ethiopian-translator";

export class MatrixController {
  constructor(
    private readonly computeMatrixUseCase: ComputeMatrixUseCase,
    private readonly logger?: Logger
  ) {}

  public async compute(req: Request, res: Response): Promise<void> {
    try {
      const parsed = MatrixRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid matrix request",
          details: parsed.error.issues,
        });
        return;
      }

      const lang = EthiopianTranslator.resolveLanguage(req);
      const result = await this.computeMatrixUseCase.execute(parsed.data);

      const durationsFormatted = result.durations.map((row) =>
        row.map((seconds) =>
          seconds != null ? EthiopianTranslator.formatDuration(seconds, lang) : null
        )
      );
      const distancesFormatted = result.distances
        ? result.distances.map((row) =>
            row.map((meters) =>
              meters != null ? EthiopianTranslator.formatDistance(meters, lang) : null
            )
          )
        : undefined;

      res.json({
        success: true,
        lang,
        ...result,
        durationsFormatted,
        distancesFormatted,
      });
    } catch (err) {
      this.logger?.error("Failed to compute matrix", { error: (err as Error).message });
      res.status(500).json({
        error: "Failed to compute distance matrix",
        message: (err as Error).message,
      });
    }
  }
}
