import { Request, Response, NextFunction } from "express";
import { PlanRouteUseCase } from "../../application/use-cases";
import { RouteRequestSchema, RouteResponseDto } from "../dto";
import { errorResponse } from "../dto";

export class RouteController {
  constructor(private readonly planRoute: PlanRouteUseCase) {}

  async plan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = RouteRequestSchema.parse(req.body);
      const start = Date.now();

      const result = await this.planRoute.execute({
        origin: parsed.origin,
        destination: parsed.destination,
        stops: parsed.stops,
        profile: parsed.profile,
        alternatives: parsed.alternatives,
        steps: parsed.steps,
      });

      const response: RouteResponseDto = {
        success: true,
        data: {
          routes: result.routes.map((r) => {
            const distMeters = typeof r.distance?.inMeters === "function" ? r.distance.inMeters() : (typeof r.distance?.value === "number" ? r.distance.value : 0);
            const durSeconds = typeof r.duration?.inSeconds === "function" ? r.duration.inSeconds() : (typeof r.duration?.value === "number" ? r.duration.value : 0);
            const distText = typeof r.distance?.toText === "function" ? r.distance.toText() : `${Math.round(distMeters)} m`;
            const durText = typeof r.duration?.toText === "function" ? r.duration.toText() : `${Math.round(durSeconds)} s`;

            return {
              id: r.id,
              summary: {
                distance: { value: distMeters, unit: "m" },
                duration: { value: durSeconds, unit: "s" },
                distanceText: distText,
                durationText: durText,
              },
              geometry: r.geometry,
              waypoints: (r.waypoints || []).map((wp) => ({
                index: wp.index,
                lat: wp.coordinates?.latitude ?? (wp as any).lat ?? 0,
                lng: wp.coordinates?.longitude ?? (wp as any).lng ?? 0,
              })),
              steps: r.steps && r.steps.length > 0 ? r.steps.map((s) => {
                const sDist = typeof s.distance?.inMeters === "function" ? s.distance.inMeters() : (typeof s.distance?.value === "number" ? s.distance.value : 0);
                const sDur = typeof s.duration?.inSeconds === "function" ? s.duration.inSeconds() : (typeof s.duration?.value === "number" ? s.duration.value : 0);
                return {
                  instruction: s.instruction,
                  distance: { value: sDist, unit: "m" },
                  duration: { value: sDur, unit: "s" },
                  type: s.type,
                  modifier: s.modifier,
                };
              }) : undefined,
              provider: r.provider,
            };
          }),
        },
        meta: {
          cached: result.cached,
          processingTime: Date.now() - start,
        },
      };

      res.json(response);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid request", err));
        return;
      }
      next(err);
    }
  }
}
