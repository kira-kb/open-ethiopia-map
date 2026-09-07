import { IImporter, ImportResult } from "./interfaces/importer.interface";
import { Place, PlaceSource } from "../../domain/entities";
import { Logger } from "../../domain/interfaces";

interface CsvConfig {
  fileUrl: string;
  format: {
    nameColumn: string;
    latColumn: string;
    lngColumn: string;
    category?: string;
    cityColumn?: string;
    mapping?: Record<string, string>;
  };
  options?: {
    skipFirstRow?: boolean;
    delimiter?: string;
  };
}

export class CsvImporter implements IImporter {
  readonly name = "csv";

  constructor(private readonly logger: Logger) {}

  async *import(config: Record<string, unknown>): AsyncGenerator<Place, ImportResult, undefined> {
    const cfg = config as unknown as CsvConfig;
    const result: ImportResult = {
      totalRecords: 0,
      importedRecords: 0,
      failedRecords: 0,
      errors: [],
    };

    this.logger.info("CSV import started", { fileUrl: cfg.fileUrl });

    try {
      const res = await fetch(cfg.fileUrl);
      const text = await res.text();
      const lines = text.split("\n");
      const delimiter = cfg.options?.delimiter || ",";
      let startRow = 0;

      if (cfg.options?.skipFirstRow) {
        startRow = 1;
      }

      for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        result.totalRecords++;

        try {
          const columns = line.split(delimiter);
          const name = this.getColumn(columns, cfg.format.nameColumn, cfg.format.mapping);
          const lat = parseFloat(this.getColumn(columns, cfg.format.latColumn, cfg.format.mapping));
          const lng = parseFloat(this.getColumn(columns, cfg.format.lngColumn, cfg.format.mapping));
          const city = cfg.format.cityColumn
            ? this.getColumn(columns, cfg.format.cityColumn, cfg.format.mapping)
            : undefined;

          if (!name || isNaN(lat) || isNaN(lng)) {
            throw new Error(`Invalid row: name="${name}" lat=${lat} lng=${lng}`);
          }

          yield new Place({
            name,
            normalizedName: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            latitude: lat,
            longitude: lng,
            city,
            country: "Ethiopia",
            category: cfg.format.category,
            source: PlaceSource.IMPORTED_DATASET,
          });

          result.importedRecords++;
        } catch (err) {
          result.failedRecords++;
          result.errors.push({ row: i + 1, error: (err as Error).message });
        }
      }
    } catch (err) {
      this.logger.error("CSV import failed", { error: (err as Error).message });
    }

    this.logger.info("CSV import completed", {
      total: result.totalRecords,
      imported: result.importedRecords,
      failed: result.failedRecords,
    });

    return result;
  }

  private getColumn(
    columns: string[],
    key: string,
    mapping?: Record<string, string>,
  ): string {
    const mappedKey = mapping?.[key] || key;
    const index = this.guessIndex(mappedKey);
    return columns[index]?.trim() || "";
  }

  private guessIndex(key: string): number {
    const headerOrder = ["name", "latitude", "lat", "longitude", "lng", "lon", "city", "phone", "website", "street", "category"];
    const idx = headerOrder.indexOf(key.toLowerCase());
    return idx >= 0 ? idx : 0;
  }
}
