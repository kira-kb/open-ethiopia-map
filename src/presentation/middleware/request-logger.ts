import { Request, Response, NextFunction } from "express";
import { Logger } from "../../domain/interfaces";
import { v4 as uuid } from "uuid";

export function createRequestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const correlationId = (req.headers["x-correlation-id"] as string) || uuid();
    const start = Date.now();

    (req as Request & { correlationId: string }).correlationId = correlationId;
    res.setHeader("x-correlation-id", correlationId);

    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info("Request completed", {
        correlationId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  };
}
