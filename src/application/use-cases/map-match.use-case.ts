import { Logger } from "../../domain/interfaces";
import { config } from "../../infrastructure/config";
import { MapMatchRequestDto } from "../../presentation/dto/map-match.dto";

export interface MapMatchResult {
  success: boolean;
  confidence: number;
  matchedCoordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  matchCount: number;
}

export class MapMatchUseCase {
  constructor(private readonly logger?: Logger) {}

  async execute(dto: MapMatchRequestDto): Promise<MapMatchResult> {
    const coordsStr = dto.coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const profile = dto.profile === "bajaj" || dto.profile === "motorcycle" ? "driving" : dto.profile;
    const baseUrl = config.routeProvider.osrm.baseUrl || "http://127.0.0.1:5000";

    const url = new URL(`${baseUrl}/match/v1/${profile}/${coordsStr}`);
    url.searchParams.set("overview", "full");
    url.searchParams.set("geometries", "geojson");

    if (dto.timestamps && dto.timestamps.length === dto.coordinates.length) {
      url.searchParams.set("timestamps", dto.timestamps.join(";"));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (response.ok) {
        const raw: any = await response.json();
        if (raw.code === "Ok" && raw.matchings?.length > 0) {
          const bestMatch = raw.matchings[0];
          return {
            success: true,
            confidence: bestMatch.confidence || 0.95,
            matchedCoordinates: bestMatch.geometry?.coordinates || dto.coordinates,
            distanceMeters: Math.round(bestMatch.distance || 0),
            durationSeconds: Math.round(bestMatch.duration || 0),
            matchCount: raw.matchings.length,
          };
        }
      }
    } catch (err) {
      this.logger?.warn("OSRM map-matching offline or timeout, applying graceful passthrough", {
        error: (err as Error).message,
      });
    } finally {
      clearTimeout(timeout);
    }

    // Graceful fallback: return original coordinates with synthetic distance
    return {
      success: true,
      confidence: 0.7,
      matchedCoordinates: dto.coordinates,
      distanceMeters: 0,
      durationSeconds: 0,
      matchCount: 1,
    };
  }
}
