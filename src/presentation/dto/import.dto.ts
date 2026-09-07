import { z } from "zod";

export const CsvColumnMappingSchema = z.object({
  nameColumn: z.string(),
  latColumn: z.string(),
  lngColumn: z.string(),
  category: z.string().optional(),
  cityColumn: z.string().optional(),
  mapping: z.record(z.string(), z.string()).optional(),
});

export const ImportRequestSchema = z.object({
  source: z.string(),
  config: z.object({
    fileUrl: z.string().url(),
    format: CsvColumnMappingSchema,
    options: z
      .object({
        skipFirstRow: z.boolean().optional(),
        delimiter: z.string().optional(),
      })
      .optional(),
  }),
});

export type ImportRequestDto = z.infer<typeof ImportRequestSchema>;

export interface ImportResponseDto {
  success: boolean;
  data: {
    jobId: string;
    status: string;
    source: string;
  };
}
