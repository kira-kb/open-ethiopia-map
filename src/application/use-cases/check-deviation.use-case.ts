import { IRouteSessionRepository } from "../../domain/interfaces/route-session-repository.interface";
import { Logger } from "../../domain/interfaces";

export interface CheckDeviationCommand {
  sessionId: string;
  latitude: number;
  longitude: number;
}

export interface DeviationResult {
  status: "on_route" | "off_route" | "no_session";
  deviationMeters: number;
  thresholdMeters: number;
}

const DEFAULT_THRESHOLD_METERS = 100;

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function minDistanceToRoute(
  lat: number, lng: number,
  coordinates: [number, number][],
): number {
  let minDist = Infinity;
  for (const [clng, clat] of coordinates) {
    const d = haversineDistance(lat, lng, clat, clng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

export class CheckDeviationUseCase {
  constructor(
    private readonly repo: IRouteSessionRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: CheckDeviationCommand): Promise<DeviationResult> {
    const session = await this.repo.findSessionById(command.sessionId);
    if (!session || !session.geometry?.coordinates?.length) {
      return { status: "no_session", deviationMeters: 0, thresholdMeters: DEFAULT_THRESHOLD_METERS };
    }

    const deviation = minDistanceToRoute(
      command.latitude,
      command.longitude,
      session.geometry.coordinates,
    );

    const isOffRoute = deviation > DEFAULT_THRESHOLD_METERS;

    if (isOffRoute) {
      this.logger.info("Driver off route", {
        sessionId: command.sessionId,
        deviationMeters: Math.round(deviation),
      });
    }

    return {
      status: isOffRoute ? "off_route" : "on_route",
      deviationMeters: Math.round(deviation),
      thresholdMeters: DEFAULT_THRESHOLD_METERS,
    };
  }
}
