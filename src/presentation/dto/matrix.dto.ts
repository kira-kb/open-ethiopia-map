import { z } from "zod";
import { ProfileSchema } from "./route.dto";

const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const MatrixRequestSchema = z.object({
  origins: z.array(CoordinateSchema).min(1, "At least 1 origin is required").max(50, "Max 50 origins allowed"),
  destinations: z.array(CoordinateSchema).min(1, "At least 1 destination is required").max(50, "Max 50 destinations allowed"),
  profile: ProfileSchema,
  annotations: z.array(z.enum(["duration", "distance"])).default(["duration", "distance"]),
});

export type MatrixRequestDto = z.infer<typeof MatrixRequestSchema>;
