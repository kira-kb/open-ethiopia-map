import { Place } from "../../../domain/entities";

export interface ImportResult {
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: Array<{ row: number; error: string }>;
}

export interface IImporter {
  readonly name: string;
  import(config: Record<string, unknown>): AsyncGenerator<Place, ImportResult, undefined>;
}
