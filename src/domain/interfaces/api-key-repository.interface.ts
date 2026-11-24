import { ApiKey, ApiKeyProps } from "../entities/api-key.entity";

export interface CreateApiKeyDto {
  name: string;
  role: "service" | "public" | "admin";
  rateLimit?: number;
  allowedOrigins?: string[];
}

export interface UpdateApiKeyDto {
  name?: string;
  rateLimit?: number;
  allowedOrigins?: string[];
  isActive?: boolean;
}

export interface IApiKeyRepository {
  findByKey(key: string): Promise<ApiKey | null>;
  findById(id: string): Promise<ApiKey | null>;
  listAll(): Promise<ApiKey[]>;
  create(dto: CreateApiKeyDto): Promise<ApiKey>;
  update(id: string, dto: UpdateApiKeyDto): Promise<ApiKey | null>;
  delete(id: string): Promise<boolean>;
  recordUsage(id: string): Promise<void>;
}
