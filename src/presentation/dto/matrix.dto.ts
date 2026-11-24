import { z } from "zod";

const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const MatrixRequestSchema = z.object({
  origins: z.array(CoordinateSchema).min(1, "At least 1 origin is required").max(50, "Max 50 origins allowed"),
  destinations: z.array(CoordinateSchema).min(1, "At least 1 destination is required").max(50, "Max 50 destinations allowed"),
  profile: z.enum(["car", "bajaj", "bike", "foot"]).default("car"),
  annotations: z.array(z.enum(["duration", "distance"])).default(["duration", "distance"]),
});

export type MatrixRequestDto = z.infer<typeof MatrixRequestSchema>;
