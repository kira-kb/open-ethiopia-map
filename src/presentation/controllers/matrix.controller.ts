import { Request, Response } from "express";
import { ComputeMatrixUseCase } from "../../application/use-cases/compute-matrix.use-case";
import { MatrixRequestSchema } from "../dto/matrix.dto";
import { Logger } from "../../domain/interfaces";

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

      const result = await this.computeMatrixUseCase.execute(parsed.data);
      res.json({
        success: true,
        ...result,
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
