import { Logger } from "../../domain/interfaces";
import { config } from "../../infrastructure/config";
import { getActiveTrafficMultiplier } from "../../domain/services/traffic/rush-hour-matrix";
import { MatrixRequestDto } from "../../presentation/dto/matrix.dto";

export interface MatrixResult {
  durations: (number | null)[][]; // seconds
  distances: (number | null)[][]; // meters
  sources: Array<{ latitude: number; longitude: number }>;
  destinations: Array<{ latitude: number; longitude: number }>;
  profile: string;
  provider: string;
}

const PROFILE_SPEED_MS: Record<string, { speedMs: number; tortuosity: number }> = {
  car: { speedMs: 10.5, tortuosity: 1.35 },    // ~38 km/h
  bajaj: { speedMs: 5.56, tortuosity: 1.32 },  // ~20 km/h
  bike: { speedMs: 3.33, tortuosity: 1.25 },   // ~12 km/h
  foot: { speedMs: 1.25, tortuosity: 1.20 },   // ~4.5 km/h
};

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class ComputeMatrixUseCase {
  constructor(private readonly logger: Logger) {}

  public async execute(dto: MatrixRequestDto): Promise<MatrixResult> {
    const { origins, destinations, profile } = dto;

    try {
      return await this.callOsrmTable(dto);
    } catch (err) {
      this.logger.warn("OSRM table endpoint failed or unreachable, switching to calibrated fallback matrix", {
        error: (err as Error).message,
        originsCount: origins.length,
        destinationsCount: destinations.length,
      });
      return this.computeFallbackMatrix(dto);
    }
  }

  private async callOsrmTable(dto: MatrixRequestDto): Promise<MatrixResult> {
    const { origins, destinations, profile } = dto;
    const osrmProfile = profile === "bajaj" || profile === "car" ? "driving" : profile === "bike" ? "bicycle" : "walking";

    // Combine all points: [origins..., destinations...]
    const allPoints = [...origins, ...destinations];
    const coordsStr = allPoints.map((c) => `${c.longitude},${c.latitude}`).join(";");

    const sourceIndices = origins.map((_, i) => i).join(";");
    const destIndices = destinations.map((_, i) => origins.length + i).join(";");

    const candidateUrls = [
      config.routeProvider.osrm.baseUrl,
      "https://router.project-osrm.org",
    ].filter(Boolean);

    let lastError: Error | null = null;

    for (const baseUrl of candidateUrls) {
      const url = new URL(`${baseUrl}/table/v1/${osrmProfile}/${coordsStr}`);
      url.searchParams.set("sources", sourceIndices);
      url.searchParams.set("destinations", destIndices);
      url.searchParams.set("annotations", "duration,distance");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.routeProvider.osrm.timeoutMs || 5000);

      try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (res.ok) {
          const raw = (await res.json()) as any;
          if (raw.code === "Ok" && Array.isArray(raw.durations)) {
            // If bajaj, adjust durations with calibrated bajaj surface factor (1.4x car duration on open roads)
            let adjustedDurations = raw.durations;
            if (profile === "bajaj") {
              adjustedDurations = raw.durations.map((row: (number | null)[]) =>
                row.map((val: number | null) => (val !== null ? Math.round(val * 1.35) : null))
              );
            }

            return {
              durations: adjustedDurations,
              distances: raw.distances || [],
              sources: origins,
              destinations,
              profile,
              provider: "osrm",
            };
          }
        }
        lastError = new Error(`OSRM table returned ${res.status}: ${res.statusText}`);
      } catch (err) {
        lastError = err as Error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new Error("All OSRM table endpoints failed");
  }

  private computeFallbackMatrix(dto: MatrixRequestDto): MatrixResult {
    const { origins, destinations, profile } = dto;
    const configSpeed = PROFILE_SPEED_MS[profile] || PROFILE_SPEED_MS.car;

    const durations: (number | null)[][] = [];
    const distances: (number | null)[][] = [];

    const now = new Date();

    for (let i = 0; i < origins.length; i++) {
      const rowDurations: (number | null)[] = [];
      const rowDistances: (number | null)[] = [];

      for (let j = 0; j < destinations.length; j++) {
        const straightMeters = haversineMeters(
          origins[i].latitude,
          origins[i].longitude,
          destinations[j].latitude,
          destinations[j].longitude
        );

        const roadDistanceMeters = Math.round(straightMeters * configSpeed.tortuosity);
        let baseDurationSeconds = Math.round(roadDistanceMeters / configSpeed.speedMs);

        // Apply dynamic rush hour congestion factor
        const { multiplier } = getActiveTrafficMultiplier(
          [[origins[i].longitude, origins[i].latitude]],
          now
        );

        const finalDurationSeconds = Math.round(baseDurationSeconds * multiplier);

        rowDistances.push(roadDistanceMeters);
        rowDurations.push(finalDurationSeconds);
      }

      distances.push(rowDistances);
      durations.push(rowDurations);
    }

    return {
      durations,
      distances,
      sources: origins,
      destinations,
      profile,
      provider: "calibrated-fallback",
    };
  }
}
