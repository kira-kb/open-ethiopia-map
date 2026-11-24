import { z } from "zod";

export const MapMatchRequestSchema = z.object({
  coordinates: z
    .array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]))
    .min(2)
    .max(100), // [[lng, lat], ...] format for MapLibre/GeoJSON
  timestamps: z.array(z.number().int()).optional(),
  profile: z.enum(["driving", "bajaj", "motorcycle", "walking"]).default("driving"),
});

export type MapMatchRequestDto = z.infer<typeof MapMatchRequestSchema>;
