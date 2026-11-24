import { Request, Response, NextFunction } from "express";
import { MapMatchUseCase } from "../../application/use-cases/map-match.use-case";
import { MapMatchRequestSchema } from "../dto/map-match.dto";
import { Logger } from "../../domain/interfaces";

export class MapMatchController {
  constructor(
    private readonly mapMatchUseCase: MapMatchUseCase,
    private readonly logger?: Logger,
  ) {}

  async match(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = MapMatchRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: "Invalid map match payload",
          details: parsed.error.issues,
        });
        return;
      }

      const result = await this.mapMatchUseCase.execute(parsed.data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
