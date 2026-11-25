import { z } from "zod";
import { ProfileSchema } from "./route.dto";

export const MapMatchRequestSchema = z.object({
  coordinates: z
    .array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]))
    .min(2)
    .max(100), // [[lng, lat], ...] format for MapLibre/GeoJSON
  timestamps: z.array(z.number().int()).optional(),
  profile: ProfileSchema,
});

export type MapMatchRequestDto = z.infer<typeof MapMatchRequestSchema>;
