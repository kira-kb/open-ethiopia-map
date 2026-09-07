import { z } from "zod";

export const RouteRequestSchema = z.object({
  origin: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  destination: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  stops: z
    .array(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
    )
    .optional(),
  profile: z
    .enum(["driving", "cycling", "walking", "motorcycle"])
    .default("driving"),
  alternatives: z.number().int().min(0).max(3).optional(),
  steps: z.boolean().optional(),
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
