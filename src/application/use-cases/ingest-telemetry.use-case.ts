import { ICache, Logger } from "../../domain/interfaces";
import { DriverTelemetryRequestDto } from "../../presentation/dto/telemetry.dto";

export interface TelemetryIngestResult {
  success: boolean;
  driverId: string;
  processedPings: number;
  averageSpeedKmh: number;
  congestedSegmentsRecorded: number;
}

export class IngestTelemetryUseCase {
  constructor(
    private readonly cache: ICache,
    private readonly logger?: Logger,
  ) {}

  async execute(dto: DriverTelemetryRequestDto): Promise<TelemetryIngestResult> {
    const { driverId, profile, pings } = dto;
    let totalSpeed = 0;
    let congestedCount = 0;

    for (const ping of pings) {
      totalSpeed += ping.speedKmh;

      // Spatial cell hash: 3 decimal places (~110m resolution)
      const latGrid = ping.lat.toFixed(3);
      const lngGrid = ping.lng.toFixed(3);
      const segmentKey = `traffic:segment:${latGrid}:${lngGrid}:${profile}`;

      // If moving speed is under 15 km/h for driving/bajaj, record congestion
      const isSlow = (profile === "driving" || profile === "bajaj") && ping.speedKmh < 15;
      if (isSlow) {
        congestedCount++;
      }

      const segmentData = {
        speedKmh: ping.speedKmh,
        bearing: ping.bearing,
        timestamp: ping.timestamp || Date.now(),
        driverId,
        congestionLevel: isSlow ? "heavy" : "normal",
      };

      // Store in Redis with 10-minute sliding window (600s TTL)
      await this.cache.set(segmentKey, segmentData, 600);
    }

    const avgSpeed = Math.round((totalSpeed / pings.length) * 10) / 10;

    this.logger?.info("Processed fleet telemetry pings", {
      driverId,
      pingsCount: pings.length,
      averageSpeedKmh: avgSpeed,
      congestedCount,
    });

    return {
      success: true,
      driverId,
      processedPings: pings.length,
      averageSpeedKmh: avgSpeed,
      congestedSegmentsRecorded: congestedCount,
    };
  }
}
