import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../dto";
import { Logger } from "../../domain/interfaces";

export function createErrorHandler(logger: Logger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
    });

    res.status(500).json(
      errorResponse("INTERNAL_ERROR", "An unexpected error occurred"),
    );
  };
}
