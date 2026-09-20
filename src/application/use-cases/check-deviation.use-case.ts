import { IRouteSessionRepository } from "../../domain/interfaces/route-session-repository.interface";
import { Logger } from "../../domain/interfaces";

export interface CheckDeviationCommand {
  sessionId: string;
  latitude: number;
  longitude: number;
  thresholdMeters?: number;
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

/**
 * Calculates the perpendicular distance from point P to segment AB.
 * Uses local metric projection to project P onto AB, clamps to segment bounds,
 * and returns the Haversine distance from P to the closest point on AB.
 */
function pointToSegmentDistance(
  pLat: number, pLng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const midLat = toRad((aLat + bLat) / 2);

  // Local metric-scaled deltas (degrees scaled by cosine of latitude for longitude)
  const cosMid = Math.cos(midLat);
  const dx = (bLng - aLng) * cosMid;
  const dy = bLat - aLat;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq < 1e-12) {
    return haversineDistance(pLat, pLng, aLat, aLng);
  }

  const px = (pLng - aLng) * cosMid;
  const py = pLat - aLat;

  // Projection parameter t
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));

  const closestLat = aLat + t * (bLat - aLat);
  const closestLng = aLng + t * (bLng - aLng);

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

function minDistanceToRoute(
  lat: number, lng: number,
  coordinates: [number, number][],
): number {
  if (coordinates.length === 0) return Infinity;
  if (coordinates.length === 1) {
    return haversineDistance(lat, lng, coordinates[0][1], coordinates[0][0]);
  }

  let minDist = Infinity;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [aLng, aLat] = coordinates[i];
    const [bLng, bLat] = coordinates[i + 1];
    const d = pointToSegmentDistance(lat, lng, aLat, aLng, bLat, bLng);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}

export class CheckDeviationUseCase {
  constructor(
    private readonly repo: IRouteSessionRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: CheckDeviationCommand): Promise<DeviationResult> {
    const threshold = command.thresholdMeters || DEFAULT_THRESHOLD_METERS;
    const session = await this.repo.findSessionById(command.sessionId);
    if (!session || !session.geometry?.coordinates?.length) {
      return { status: "no_session", deviationMeters: 0, thresholdMeters: threshold };
    }

    const deviation = minDistanceToRoute(
      command.latitude,
      command.longitude,
      session.geometry.coordinates,
    );

    const isOffRoute = deviation > threshold;

    if (isOffRoute) {
      this.logger.info("Driver off route", {
        sessionId: command.sessionId,
        deviationMeters: Math.round(deviation),
        thresholdMeters: threshold,
      });
    }

    return {
      status: isOffRoute ? "off_route" : "on_route",
      deviationMeters: Math.round(deviation),
      thresholdMeters: threshold,
    };
  }
}
