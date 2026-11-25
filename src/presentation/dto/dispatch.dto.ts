import { z } from "zod";

const CoordinateSchema = z.union([
  z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).transform((val) => ({ latitude: val.lat, longitude: val.lng })),
  z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
]);

export const CandidateDriverSchema = z.object({
  driverId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  vehicleType: z.string().optional(),
});

export const DispatchNearbyRequestSchema = z.object({
  pickup: CoordinateSchema,
  vehicleType: z.string().default("any"),
  deliveryId: z.string().optional(),
  radiusKm: z.number().min(0.1).max(50).default(5),
  limit: z.number().int().min(1).max(50).default(10),
  geoKey: z.string().default("active_drivers"),
  profilePrefix: z.string().default("driver:"),
  candidates: z.array(CandidateDriverSchema).optional(),
});

export type DispatchNearbyRequestDto = z.infer<typeof DispatchNearbyRequestSchema>;

export interface RankedDispatchCandidate {
  driverId: string;
  vehicleType: string;
  vehicleLabel?: string;
  coordinates: { latitude: number; longitude: number };
  straightDistanceMeters: number;
  roadDistanceMeters: number;
  roadDurationSeconds: number;
  etaMinutes: number;
  etaText?: string;
  roadDistanceText?: string;
}

export interface DispatchNearbyResponseDto {
  success: boolean;
  pickup: { latitude: number; longitude: number };
  requestedVehicleType: string;
  count: number;
  candidates: RankedDispatchCandidate[];
  lang?: string;
}
