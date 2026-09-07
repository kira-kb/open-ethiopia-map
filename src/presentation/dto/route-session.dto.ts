import { z } from "zod";

const CoordinateSchema = z.union([
  z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).transform((val) => ({ lat: val.latitude, lng: val.longitude })),
]);

export const CreateRouteSessionSchema = z.object({
  deliveryId: z.string().min(1),
  origin: CoordinateSchema,
  destination: CoordinateSchema,
  stops: z.array(CoordinateSchema).optional(),
  profile: z.enum(["driving", "cycling", "walking", "motorcycle"]).default("driving"),
});

export const ReplanRouteSessionSchema = z.object({
  origin: CoordinateSchema.optional(),
  destination: CoordinateSchema.optional(),
  stops: z.array(CoordinateSchema).optional(),
  profile: z.enum(["driving", "cycling", "walking", "motorcycle"]).optional(),
  reason: z.enum(["DRIVER_REQUEST", "TRAFFIC", "ROAD_CLOSED", "PROVIDER_FAILOVER", "SYSTEM"]).default("DRIVER_REQUEST"),
});

export interface RouteSessionResponseDto {
  id: string;
  deliveryId: string;
  provider: string;
  profile: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  geometry: { type: string; coordinates: [number, number][] };
  instructions?: Array<{ instruction: string; distance: number; duration: number; type: string; modifier: string }>;
  currentRevision: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteRevisionResponseDto {
  id: string;
  version: number;
  provider: string;
  profile: string;
  geometry: { type: string; coordinates: [number, number][] };
  distanceMeters: number;
  durationSeconds: number;
  instructions?: Array<{ instruction: string; distance: number; duration: number; type: string; modifier: string }>;
  reason: string;
  cacheHit: boolean;
  createdAt: string;
}
