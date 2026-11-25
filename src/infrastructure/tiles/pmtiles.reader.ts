import fs from "fs";
import path from "path";
import { PMTiles, Source, RangeResponse } from "pmtiles";
import { Logger } from "../../domain/interfaces";

export class NodeFsSource implements Source {
  constructor(private readonly filePath: string) {}

  getKey(): string {
    return this.filePath;
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    const handle = await fs.promises.open(this.filePath, "r");
    try {
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, offset);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
      return {
        data: arrayBuffer,
      };
    } finally {
      await handle.close();
    }
  }
}

export class PmTilesReader {
  private pmtilesInstance: PMTiles | null = null;
  private isLoaded = false;
  private readonly filePath: string;

  constructor(
    customPath?: string,
    private readonly logger?: Logger,
  ) {
    const candidatePaths = [
      customPath,
      process.env.MAP_TILES_PATH,
      "/data/tiles/ethiopia.pmtiles",
      path.join(process.cwd(), "data", "tiles", "ethiopia.pmtiles"),
      path.resolve(__dirname, "../../../data/tiles/ethiopia.pmtiles"),
    ].filter(Boolean) as string[];

    this.filePath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
    this.init();
  }

  private init(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        const candidatePaths = [
          process.env.MAP_TILES_PATH,
          "/data/tiles/ethiopia.pmtiles",
          path.join(process.cwd(), "data", "tiles", "ethiopia.pmtiles"),
          path.resolve(__dirname, "../../../data/tiles/ethiopia.pmtiles"),
        ].filter(Boolean) as string[];
        const found = candidatePaths.find((p) => fs.existsSync(p));
        if (found) {
          (this as any).filePath = found;
        }
      }

      if (fs.existsSync(this.filePath)) {
        const source = new NodeFsSource(this.filePath);
        this.pmtilesInstance = new PMTiles(source);
        this.isLoaded = true;
        this.logger?.info("Loaded local PMTiles vector archive", { path: this.filePath });
      } else {
        this.logger?.debug("Local PMTiles archive not present", { path: this.filePath });
      }
    } catch (err) {
      this.logger?.warn("Failed to initialize PMTiles reader", { error: (err as Error).message });
    }
  }

  isAvailable(): boolean {
    if (!this.isLoaded) {
      this.init();
    }
    return this.isLoaded && this.pmtilesInstance !== null;
  }

  async getTile(z: number, x: number, y: number): Promise<ArrayBuffer | null> {
    if (!this.isAvailable() || !this.pmtilesInstance) {
      return null;
    }

    try {
      // PMTiles.getZxy() already decompresses the tile according to the
      // archive's tileCompression setting. The returned bytes are raw MVT,
      // so callers must NOT set Content-Encoding: gzip on the HTTP response.
      const response = await this.pmtilesInstance.getZxy(z, x, y);
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (err) {
      this.logger?.warn("Error reading vector tile from PMTiles", { z, x, y, error: (err as Error).message });
      return null;
    }
  }
}
