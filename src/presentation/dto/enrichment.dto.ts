import { z } from "zod";
import { EnrichmentExtraDetails } from "../../domain/entities";

export const SaveLocationEnrichmentSchema = z.object({
  placeId: z.string().optional(),
  locationId: z.string().optional(),
  coordHash: z.string().optional(),
  finalName: z.string().min(1, "Final name is required"),
  suggestedName: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationType: z.string().optional(),
  extraDetails: z.record(z.string(), z.unknown()).optional(),
  isEdit: z.boolean().optional().default(false),
  userId: z.string().optional(),
  sourceProvider: z.string().optional(),
  savePlace: z.boolean().optional().default(false),
  savedLabel: z.string().optional(),
});

export type SaveLocationEnrichmentDto = z.infer<typeof SaveLocationEnrichmentSchema>;

export interface SaveLocationEnrichmentResponseDto {
  success: boolean;
  data?: {
    message: string;
    enrichmentId?: string;
    savedPlaceId?: string;
  };
  msg?: string;
}
