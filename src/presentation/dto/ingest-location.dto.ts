import { z } from "zod";

export const SingleLocationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Location name is required"),
  officialName: z.string().optional(),
  displayName: z.string().optional(),
  shortName: z.string().optional(),
  aliases: z.array(z.string()).optional().default([]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationType: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  formattedAddress: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  building: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  unit: z.string().optional(),
  district: z.string().optional(),
  subcity: z.string().optional(),
  city: z.string().optional().default("Addis Ababa"),
  country: z.string().optional().default("Ethiopia"),
  postalCode: z.string().optional(),
  sourceProvider: z.string().optional(),
  providerPlaceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  verified: z.boolean().optional().default(false),
});

export type SingleLocationItem = z.infer<typeof SingleLocationItemSchema>;

export const IngestLocationPayloadSchema = z.union([
  // Array of items directly
  z.array(SingleLocationItemSchema),
  // Wrapper object with locations array
  z.object({
    sourceProvider: z.string().optional(),
    locations: z.array(SingleLocationItemSchema),
  }),
  // Single item directly
  SingleLocationItemSchema,
]);

export type IngestLocationPayload = z.infer<typeof IngestLocationPayloadSchema>;

export interface IngestItemResult {
  name: string;
  latitude: number;
  longitude: number;
  action: "CREATED" | "ALIAS_ADDED" | "UPDATED" | "ERROR";
  locationId?: string;
  aliasesCount?: number;
  matchedPlaceId?: string;
  matchedName?: string;
  error?: string;
}

export interface IngestLocationResponseDto {
  success: boolean;
  data: {
    message: string;
    totalReceived: number;
    created: number;
    aliasesAdded: number;
    updated: number;
    failed: number;
    results: IngestItemResult[];
  };
  msg?: string;
}
