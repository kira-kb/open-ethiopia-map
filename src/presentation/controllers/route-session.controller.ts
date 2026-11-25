import { Request, Response, NextFunction } from "express";
import { CreateRouteSessionUseCase, GetRouteSessionUseCase, ReplanRouteSessionUseCase, GetRouteHistoryUseCase, CloseRouteSessionUseCase, CheckDeviationUseCase } from "../../application/use-cases";
import { CreateRouteSessionSchema, ReplanRouteSessionSchema } from "../dto/route-session.dto";
import { errorResponse } from "../dto";
import { EthiopianTranslator, SupportedLanguage } from "../../domain/services/localization/ethiopian-translator";

export class RouteSessionController {
  constructor(
    private readonly createUseCase: CreateRouteSessionUseCase,
    private readonly getUseCase: GetRouteSessionUseCase,
    private readonly replanUseCase: ReplanRouteSessionUseCase,
    private readonly historyUseCase: GetRouteHistoryUseCase,
    private readonly closeUseCase: CloseRouteSessionUseCase,
    private readonly deviationUseCase: CheckDeviationUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateRouteSessionSchema.parse(req.body);
      const start = Date.now();
      const lang = EthiopianTranslator.resolveLanguage(req);

      const { session, cached } = await this.createUseCase.execute({
        deliveryId: parsed.deliveryId,
        origin: parsed.origin,
        destination: parsed.destination,
        stops: parsed.stops,
        profile: parsed.profile,
      });

      res.status(201).json({
        success: true,
        data: { session: this.sessionToDto(session, lang) },
        meta: { cached, processingTime: Date.now() - start },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid request", err));
        return;
      }
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.id as string;
      const lang = EthiopianTranslator.resolveLanguage(req);
      const session = await this.getUseCase.execute(sessionId);
      if (!session) {
        res.status(404).json(errorResponse("NOT_FOUND", "Route session not found"));
        return;
      }
      res.json({
        success: true,
        data: { session: this.sessionToDto(session, lang) },
      });
    } catch (err) {
      next(err);
    }
  }

  async getByDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveryId = req.params.deliveryId as string;
      const lang = EthiopianTranslator.resolveLanguage(req);
      const session = await this.getUseCase.executeByDeliveryId(deliveryId);
      if (!session) {
        res.status(404).json(errorResponse("NOT_FOUND", "Route session not found for delivery"));
        return;
      }
      res.json({
        success: true,
        data: { session: this.sessionToDto(session, lang) },
      });
    } catch (err) {
      next(err);
    }
  }

  async replan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ReplanRouteSessionSchema.parse(req.body);
      const start = Date.now();
      const lang = EthiopianTranslator.resolveLanguage(req);

      const { session, revision } = await this.replanUseCase.execute({
        sessionId: req.params.id as string,
        origin: parsed.origin,
        destination: parsed.destination,
        stops: parsed.stops,
        profile: parsed.profile,
        reason: parsed.reason as any,
      });

      res.json({
        success: true,
        data: {
          session: this.sessionToDto(session, lang),
          revision: this.revisionToDto(revision, lang),
        },
        meta: { processingTime: Date.now() - start },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid request", err));
        return;
      }
      if (err instanceof Error && err.message.includes("Cannot replan")) {
        res.status(409).json(errorResponse("CONFLICT", err.message));
        return;
      }
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lang = EthiopianTranslator.resolveLanguage(req);
      const revisions = await this.historyUseCase.execute(req.params.id as string);
      res.json({
        success: true,
        data: { revisions: revisions.map((r) => this.revisionToDto(r, lang)) },
      });
    } catch (err) {
      next(err);
    }
  }

  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.closeUseCase.execute({
        sessionId: req.params.id as string,
        reason: req.body?.reason === "cancelled" ? "cancelled" : "completed",
      });
      res.json({ success: true, message: "Route session closed" });
    } catch (err) {
      next(err);
    }
  }

  async checkDeviation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const latitude = req.body?.latitude ?? req.body?.lat;
      const longitude = req.body?.longitude ?? req.body?.lng;
      if (latitude == null || longitude == null) {
        res.status(400).json({ success: false, message: "latitude and longitude (or lat and lng) required" });
        return;
      }
      const lang = EthiopianTranslator.resolveLanguage(req);
      const result = await this.deviationUseCase.execute({
        sessionId: req.params.id as string,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      const message = lang === "am"
        ? (result.status === "on_route"
            ? "አሽከርካሪው በትክክለኛው መንገድ ላይ ነው"
            : result.status === "off_route"
            ? `አሽከርካሪው ከተመደበው መንገድ ${EthiopianTranslator.formatDistance(result.deviationMeters, "am")} ወጥቷል`
            : "የመንገድ ክፍለ ጊዜ አልተገኘም")
        : (result.status === "on_route"
            ? "Driver is on route"
            : result.status === "off_route"
            ? `Driver is off route by ${EthiopianTranslator.formatDistance(result.deviationMeters, "en")}`
            : "Route session not found");

      res.json({
        success: true,
        data: {
          ...result,
          message,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  private sessionToDto(session: any, lang: SupportedLanguage = "en"): any {
    return {
      id: session.id,
      deliveryId: session.deliveryId,
      provider: session.provider,
      profile: session.profile,
      origin: { lat: session.origin.latitude, lng: session.origin.longitude },
      destination: { lat: session.destination.latitude, lng: session.destination.longitude },
      distanceMeters: session.distanceMeters,
      durationSeconds: session.durationSeconds,
      distanceText: EthiopianTranslator.formatDistance(session.distanceMeters, lang),
      durationText: EthiopianTranslator.formatDuration(session.durationSeconds, lang),
      geometry: session.geometry,
      instructions: session.instructions,
      currentRevision: session.currentRevision,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  private revisionToDto(revision: any, lang: SupportedLanguage = "en"): any {
    return {
      id: revision.id,
      version: revision.version,
      provider: revision.provider,
      profile: revision.profile,
      geometry: revision.geometry,
      distanceMeters: revision.distanceMeters,
      durationSeconds: revision.durationSeconds,
      distanceText: EthiopianTranslator.formatDistance(revision.distanceMeters, lang),
      durationText: EthiopianTranslator.formatDuration(revision.durationSeconds, lang),
      instructions: revision.instructions,
      reason: revision.reason,
      cacheHit: revision.cacheHit,
      createdAt: revision.createdAt.toISOString(),
    };
  }
}
