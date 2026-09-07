import { z } from "zod";

export const ReverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(1).optional().default(50),
});

export type ReverseGeocodeQueryDto = z.infer<typeof ReverseGeocodeQuerySchema>;

export interface ReverseGeocodeResponseDto {
  success: boolean;
  data: {
    address: {
      street?: string;
      building?: string;
      city?: string;
      subcity?: string;
      region?: string;
      country: string;
      postcode?: string;
      formatted: string;
    };
    nearbyPlaces?: Array<{
      id?: string;
      name: string;
      distance?: { value: number; unit: string };
    }>;
    source: string;
  };
}
