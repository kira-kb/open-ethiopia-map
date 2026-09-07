import { z } from "zod";

export const CreateRouteSessionSchema = z.object({
  deliveryId: z.string().min(1),
  origin: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  destination: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  stops: z.array(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })).optional(),
  profile: z.enum(["driving", "cycling", "walking", "motorcycle"]).default("driving"),
});

export const ReplanRouteSessionSchema = z.object({
  origin: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  destination: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  stops: z.array(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })).optional(),
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
