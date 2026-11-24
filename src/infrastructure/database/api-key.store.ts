import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ApiKey, ApiKeyProps } from "../../domain/entities/api-key.entity";
import {
  IApiKeyRepository,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from "../../domain/interfaces/api-key-repository.interface";
import { Logger } from "../../domain/interfaces";

interface AdminUserRecord {
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
}

interface StoredData {
  keys: ApiKeyProps[];
  admin: AdminUserRecord;
}

export class ApiKeyStore implements IApiKeyRepository {
  private filePath: string;
  private memoryKeys: Map<string, ApiKey> = new Map(); // key -> ApiKey
  private idMap: Map<string, ApiKey> = new Map(); // id -> ApiKey
  private adminRecord: AdminUserRecord;
  private logger?: Logger;

  constructor(customFilePath?: string, logger?: Logger) {
    this.logger = logger;
    this.filePath =
      customFilePath ||
      path.resolve(process.cwd(), "data", "api-keys.json");

    this.adminRecord = this.createDefaultAdmin();
    this.load();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  }

  private createDefaultAdmin(): AdminUserRecord {
    const salt = "ethiopia_map_salt_2026";
    return {
      email: "kirubelbewket@gmail.com",
      passwordHash: this.hashPassword("Pass@123", salt),
      salt,
      role: "admin",
    };
  }

  public verifyAdminCredentials(email: string, password: string): boolean {
    if (email.trim().toLowerCase() !== this.adminRecord.email.toLowerCase()) {
      return false;
    }
    const computedHash = this.hashPassword(password, this.adminRecord.salt);
    const bufA = Buffer.from(computedHash, "hex");
    const bufB = Buffer.from(this.adminRecord.passwordHash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  private ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Fallback or permission handling
      }
    }
  }

  private load(): void {
    try {
      this.ensureDirectoryExists(this.filePath);
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const data: StoredData = JSON.parse(raw);
        if (data.admin) {
          this.adminRecord = data.admin;
        }
        if (Array.isArray(data.keys)) {
          for (const k of data.keys) {
            const entity = new ApiKey(k);
            this.memoryKeys.set(entity.key, entity);
            this.idMap.set(entity.id, entity);
          }
        }
      }
    } catch (err) {
      this.logger?.warn("Failed to load api-keys.json, initializing defaults", {
        error: (err as Error).message,
      });
    }

    // Seed defaults if empty
    if (this.memoryKeys.size === 0) {
      this.seedDefaultKeys();
    }
  }

  private seedDefaultKeys(): void {
    const defaultKeys: ApiKeyProps[] = [
      {
        id: "key_ride_backend_default",
        name: "Ride-Hailing Production Backend",
        key: "sk_ride_live_addis_7f8a92bcde10",
        role: "service",
        rateLimit: 600,
        allowedOrigins: ["*"],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
      {
        id: "key_delivery_backend_default",
        name: "Delivery Production Backend",
        key: "sk_delivery_live_gondar_3b1c559812a4",
        role: "service",
        rateLimit: 600,
        allowedOrigins: ["*"],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
      {
        id: "key_driver_mobile_default",
        name: "Driver Mobile App (MapLibre Tiles)",
        key: "pk_driver_live_44e9b277ac11",
        role: "public",
        rateLimit: 1200,
        allowedOrigins: ["*"],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
      {
        id: "key_customer_web_default",
        name: "Customer Web App (MapLibre Tiles)",
        key: "pk_customer_live_99d12a884ef1",
        role: "public",
        rateLimit: 1200,
        allowedOrigins: ["*"],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    ];

    for (const k of defaultKeys) {
      const entity = new ApiKey(k);
      this.memoryKeys.set(entity.key, entity);
      this.idMap.set(entity.id, entity);
    }
    this.save();
  }

  private save(): void {
    try {
      this.ensureDirectoryExists(this.filePath);
      const data: StoredData = {
        admin: this.adminRecord,
        keys: Array.from(this.idMap.values()).map((k) => k.toJSON()),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      this.logger?.error("Failed to write to api-keys.json", {
        error: (err as Error).message,
      });
    }
  }

  public async findByKey(key: string): Promise<ApiKey | null> {
    const found = this.memoryKeys.get(key);
    return found || null;
  }

  public async findById(id: string): Promise<ApiKey | null> {
    const found = this.idMap.get(id);
    return found || null;
  }

  public async listAll(): Promise<ApiKey[]> {
    return Array.from(this.idMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async create(dto: CreateApiKeyDto): Promise<ApiKey> {
    const id = "key_" + crypto.randomBytes(8).toString("hex");
    const prefix = dto.role === "public" ? "pk_live_" : "sk_live_";
    const secretPart = crypto.randomBytes(16).toString("hex");
    const generatedKey = `${prefix}${secretPart}`;

    const newKey = new ApiKey({
      id,
      name: dto.name,
      key: generatedKey,
      role: dto.role,
      rateLimit: dto.rateLimit || (dto.role === "public" ? 1200 : 600),
      allowedOrigins: dto.allowedOrigins && dto.allowedOrigins.length > 0 ? dto.allowedOrigins : ["*"],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    });

    this.memoryKeys.set(newKey.key, newKey);
    this.idMap.set(newKey.id, newKey);
    this.save();
    return newKey;
  }

  public async update(id: string, dto: UpdateApiKeyDto): Promise<ApiKey | null> {
    const existing = this.idMap.get(id);
    if (!existing) return null;

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.rateLimit !== undefined) existing.rateLimit = dto.rateLimit;
    if (dto.allowedOrigins !== undefined) existing.allowedOrigins = dto.allowedOrigins;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;

    this.save();
    return existing;
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.idMap.get(id);
    if (!existing) return false;

    this.memoryKeys.delete(existing.key);
    this.idMap.delete(id);
    this.save();
    return true;
  }

  public async recordUsage(id: string): Promise<void> {
    const existing = this.idMap.get(id);
    if (existing) {
      existing.lastUsedAt = new Date().toISOString();
      // Throttle disk writes to avoid I/O bottlenecks
    }
  }
}
