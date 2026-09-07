import { z } from "zod";

export const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(1).optional().default(500),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type NearbyQueryDto = z.infer<typeof NearbyQuerySchema>;
