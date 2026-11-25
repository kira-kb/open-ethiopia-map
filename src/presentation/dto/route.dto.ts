import { z } from "zod";
import { normalizeProfile } from "../../domain/value-objects";

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

export const ProfileSchema = z
  .string()
  .transform((val, ctx) => {
    const normalized = normalizeProfile(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid profile: "${val}". Supported profiles: driving, bajaj, cycling, walking, motorcycle (aliases: car, bike, foot, moto, tuktuk)`,
      });
      return z.NEVER;
    }
    return normalized as "driving" | "bajaj" | "cycling" | "walking" | "motorcycle";
  })
  .default("driving");

export const RouteRequestSchema = z.object({
  origin: CoordinateSchema,
  destination: CoordinateSchema,
  stops: z.array(CoordinateSchema).optional(),
  profile: ProfileSchema,
  alternatives: z.number().int().min(0).max(3).optional(),
  steps: z.boolean().optional(),
  lang: z.enum(["en", "am"]).default("en"),
});

export type RouteRequestDto = z.infer<typeof RouteRequestSchema>;

export interface RouteResponseDto {
  success: boolean;
  data: {
    routes: Array<{
      id: string;
      summary: {
        distance: { value: number; unit: string };
        duration: { value: number; unit: string };
        distanceText: string;
        durationText: string;
      };
      geometry: {
        type: string;
        coordinates: [number, number][];
      };
      waypoints: Array<{
        index: number;
        lat: number;
        lng: number;
      }>;
      steps?: Array<{
        instruction: string;
        distance: { value: number; unit: string };
        duration: { value: number; unit: string };
        type: string;
        modifier: string;
      }>;
      provider: string;
    }>;
  };
  meta: {
    cached: boolean;
    processingTime: number;
  };
}
