import { z } from "zod";

export const AutocompleteQuerySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
  limit: z.coerce.number().int().min(1).max(25).optional().default(8),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().optional(),
  categories: z.string().optional(),
  type: z.enum(["all", "city", "place", "address"]).optional().default("all"),
  userId: z.string().optional(),
});

export type AutocompleteQueryDto = z.infer<typeof AutocompleteQuerySchema>;

export interface AutocompleteResponseDto {
  success: boolean;
  data: {
    places: Array<{
      id?: string;
      name: string;
      address?: string;
      latitude: number;
      longitude: number;
      city?: string;
      source: string;
      confidence?: number;
      distance?: { value: number; unit: string } | null;
      recommendedName?: string;
      locationType?: string;
      locationTypeOptions?: string[];
      extraFields?: Array<{
        key: string;
        label: string;
        type: "text" | "number";
        optional?: boolean;
        reason?: string;
      }>;
      isSavedPlace?: boolean;
      savedLabel?: string;
      badge?: string;
      icon?: string;
    }>;
  };
  meta: {
    total: number;
    sources: string[];
    cached: boolean;
    processingTime: number;
  };
}
