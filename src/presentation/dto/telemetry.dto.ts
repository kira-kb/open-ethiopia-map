import { z } from "zod";
import { ProfileSchema } from "./route.dto";

export const TelemetryPingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(250),
  bearing: z.number().min(0).max(360).optional(),
  timestamp: z.number().int().positive().optional(),
});

export const DriverTelemetryRequestSchema = z.object({
  driverId: z.string().min(1),
  profile: ProfileSchema,
  pings: z.array(TelemetryPingSchema).min(1).max(100),
});

export type DriverTelemetryRequestDto = z.infer<typeof DriverTelemetryRequestSchema>;
