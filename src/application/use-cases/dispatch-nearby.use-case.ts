import { RedisCache } from "../../infrastructure/cache/redis.cache";
import { ComputeMatrixUseCase } from "./compute-matrix.use-case";
import {
  DispatchNearbyRequestDto,
  DispatchNearbyResponseDto,
  RankedDispatchCandidate,
} from "../../presentation/dto/dispatch.dto";
import { Logger } from "../../domain/interfaces";

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
  return Math.round(R * c);
}

function normalizeVehicle(type: string): string {
  const t = (type || "").toUpperCase().trim();
  if (t === "BAJAJ" || t === "TUKTUK") return "bajaj";
  if (t === "CAR" || t === "AUTOMOBILE" || t === "SEDAN") return "car";
  if (t === "MOTORCYCLE" || t === "BIKE") return "bike";
  if (t === "TRUCK" || t === "VAN") return "truck";
  return "any";
}

export class DispatchNearbyUseCase {
  constructor(
    private readonly computeMatrixUseCase: ComputeMatrixUseCase,
    private readonly cache: RedisCache,
    private readonly logger?: Logger
  ) {}

  public async execute(dto: DispatchNearbyRequestDto): Promise<DispatchNearbyResponseDto> {
    const { pickup, deliveryId, radiusKm, limit } = dto;
    const requestedVehicle = normalizeVehicle(dto.vehicleType);
    let rawCandidates: Array<{
      driverId: string;
      latitude: number;
      longitude: number;
      vehicleType: string;
      straightDistanceMeters: number;
    }> = [];

    // 1. If explicit candidates are provided in body
    if (dto.candidates && dto.candidates.length > 0) {
      rawCandidates = dto.candidates.map((c) => ({
        driverId: c.driverId,
        latitude: c.latitude,
        longitude: c.longitude,
        vehicleType: c.vehicleType || (requestedVehicle !== "any" ? requestedVehicle : "car"),
        straightDistanceMeters: haversineMeters(
          pickup.latitude,
          pickup.longitude,
          c.latitude,
          c.longitude
        ),
      }));
    } else {
      // 2. Query Redis GEO directly
      rawCandidates = await this.queryRedisCandidates(dto, requestedVehicle);
    }

    if (!rawCandidates.length) {
      return {
        success: true,
        pickup,
        requestedVehicleType: dto.vehicleType,
        count: 0,
        candidates: [],
      };
    }

    // 3. Compute Road Distance & Duration Matrix via Map Engine
    const profile = requestedVehicle === "bajaj" ? "bajaj" : requestedVehicle === "bike" ? "bike" : "car";
    const origins = rawCandidates.map((c) => ({ latitude: c.latitude, longitude: c.longitude }));
    const destinations = [{ latitude: pickup.latitude, longitude: pickup.longitude }];

    let durations: (number | null)[][] = [];
    let distances: (number | null)[][] = [];

    try {
      const matrixResult = await this.computeMatrixUseCase.execute({
        origins,
        destinations,
        profile: profile as any,
        annotations: ["duration", "distance"],
      });
      durations = matrixResult.durations;
      distances = matrixResult.distances;
    } catch (err) {
      this.logger?.warn("Matrix calculation failed during dispatch, using calibrated straight-line fallback", {
        error: (err as Error).message,
      });
    }

    // 4. Combine spatial metrics & sort by true road duration
    const rankedCandidates: RankedDispatchCandidate[] = rawCandidates.map((c, idx) => {
      const roadDist =
        distances[idx]?.[0] !== undefined && distances[idx]?.[0] !== null
          ? Number(distances[idx][0])
          : Math.round(c.straightDistanceMeters * (profile === "bajaj" ? 1.32 : 1.35));

      const roadDur =
        durations[idx]?.[0] !== undefined && durations[idx]?.[0] !== null
          ? Number(durations[idx][0])
          : Math.round(roadDist / (profile === "bajaj" ? 5.56 : 10.5));

      return {
        driverId: c.driverId,
        vehicleType: c.vehicleType,
        coordinates: { latitude: c.latitude, longitude: c.longitude },
        straightDistanceMeters: c.straightDistanceMeters,
        roadDistanceMeters: roadDist,
        roadDurationSeconds: roadDur,
        etaMinutes: Math.round((roadDur / 60) * 10) / 10,
      };
    });

    rankedCandidates.sort((a, b) => a.roadDurationSeconds - b.roadDurationSeconds);

    const limited = rankedCandidates.slice(0, limit);

    return {
      success: true,
      pickup,
      requestedVehicleType: dto.vehicleType,
      count: limited.length,
      candidates: limited,
    };
  }

  private async queryRedisCandidates(
    dto: DispatchNearbyRequestDto,
    requestedVehicle: string
  ): Promise<
    Array<{
      driverId: string;
      latitude: number;
      longitude: number;
      vehicleType: string;
      straightDistanceMeters: number;
    }>
  > {
    const client = this.cache.getRawClient();
    if (!client) {
      this.logger?.warn("Redis client not connected in Map Service; cannot query active_drivers directly");
      return [];
    }

    const { pickup, deliveryId, radiusKm, limit } = dto;
    const geoKey = dto.geoKey || "active_drivers";

    try {
      // 1. GEOSEARCH: find nearby available drivers in Redis (sorted by distance ASC)
      // ioredis geosearch returns [[driverId, distance, [lng, lat]], ...]
      const geoResults: any = await client.geosearch(
        geoKey,
        "FROMLONLAT",
        pickup.longitude,
        pickup.latitude,
        "BYRADIUS",
        radiusKm,
        "km",
        "WITHCOORD",
        "WITHDIST",
        "ASC"
      );

      if (!Array.isArray(geoResults) || geoResults.length === 0) {
        return [];
      }

      // 2. Exclude declined/filtered drivers if deliveryId is provided
      let excludedSet = new Set<string>();
      if (deliveryId) {
        const excluded = await client.smembers(`filtered_drivers:${deliveryId}`);
        if (Array.isArray(excluded)) {
          excludedSet = new Set(excluded);
        }
      }

      const eligibleResults = geoResults.filter((item: any) => {
        const id = Array.isArray(item) ? item[0] : item;
        return !excludedSet.has(id);
      });

      if (eligibleResults.length === 0) return [];

      // 3. Pipeline HMGET driver:<id> vehicleType, latitude, longitude
      const isAny = requestedVehicle === "any";
      const profilePrefix = dto.profilePrefix || "driver:";
      const driverVehicleMap = new Map<string, string>();
      const driverCoordMap = new Map<string, { lat: number; lng: number }>();

      const pipeline = client.pipeline();
      const hasHmget = typeof (pipeline as any).hmget === "function";
      for (const item of eligibleResults) {
        const id = Array.isArray(item) ? item[0] : item;
        if (hasHmget) {
          (pipeline as any).hmget(`${profilePrefix}${id}`, "vehicleType", "latitude", "longitude");
        } else if (typeof (pipeline as any).hget === "function") {
          (pipeline as any).hget(`${profilePrefix}${id}`, "vehicleType");
        }
      }
      const pipeResults = await pipeline.exec();

      eligibleResults.forEach((item: any, idx: number) => {
        const id = Array.isArray(item) ? item[0] : item;
        const err = pipeResults?.[idx]?.[0];
        const res = pipeResults?.[idx]?.[1];
        if (!err && res) {
          if (Array.isArray(res)) {
            const rawVType = res[0];
            const rawLat = res[1];
            const rawLng = res[2];
            if (rawVType) {
              driverVehicleMap.set(id, normalizeVehicle(rawVType));
            }
            if (rawLat && rawLng) {
              const latNum = parseFloat(rawLat);
              const lngNum = parseFloat(rawLng);
              if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0)) {
                driverCoordMap.set(id, { lat: latNum, lng: lngNum });
              }
            }
          } else if (typeof res === "string") {
            driverVehicleMap.set(id, normalizeVehicle(res));
          }
        }
        if (!driverVehicleMap.has(id)) {
          driverVehicleMap.set(id, "car");
        }
      });

      // 4. Build and filter candidate objects
      const candidates: Array<{
        driverId: string;
        latitude: number;
        longitude: number;
        vehicleType: string;
        straightDistanceMeters: number;
      }> = [];

      for (const item of eligibleResults) {
        const id = Array.isArray(item) ? item[0] : item;
        const distKm = Array.isArray(item) ? parseFloat(item[1]) || 0 : 0;
        const coords = Array.isArray(item) ? item[2] : null; // [lng, lat]
        let lng = coords ? parseFloat(coords[0]) : 0;
        let lat = coords ? parseFloat(coords[1]) : 0;

        // Fallback to coordinates from driver hash if geosearch didn't supply them
        if ((lat === 0 && lng === 0) || isNaN(lat) || isNaN(lng)) {
          const fallback = driverCoordMap.get(id);
          if (fallback) {
            lat = fallback.lat;
            lng = fallback.lng;
          }
        }

        const vType = driverVehicleMap.get(id) || "car";
        if (!isAny && vType !== requestedVehicle) {
          continue;
        }

        candidates.push({
          driverId: id,
          latitude: lat,
          longitude: lng,
          vehicleType: vType,
          straightDistanceMeters: Math.round(distKm * 1000),
        });

        // Cap candidates before running matrix to protect matrix CPU
        if (candidates.length >= Math.max(limit * 2, 20)) break;
      }

      return candidates;
    } catch (err) {
      this.logger?.error("Failed to query Redis active_drivers", { error: (err as Error).message });
      return [];
    }
  }
}
