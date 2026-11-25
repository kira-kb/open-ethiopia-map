export type ApiKeyRole = "service" | "public" | "admin";

export interface ApiKeyProps {
  id: string;
  name: string;
  key: string;
  role: ApiKeyRole;
  rateLimit: number; // requests per minute
  allowedOrigins?: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
}

export class ApiKey {
  public readonly id: string;
  public name: string;
  public readonly key: string;
  public readonly role: ApiKeyRole;
  public rateLimit: number;
  public allowedOrigins: string[];
  public isActive: boolean;
  public readonly createdAt: string;
  public lastUsedAt: string | null;

  constructor(props: ApiKeyProps) {
    this.id = props.id;
    this.name = props.name;
    this.key = props.key;
    this.role = props.role;
    this.rateLimit = props.rateLimit;
    this.allowedOrigins = props.allowedOrigins || ["*"];
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.lastUsedAt = props.lastUsedAt || null;
  }

  public isServiceKey(): boolean {
    return this.role === "service" || this.role === "admin";
  }

  public isPublicKey(): boolean {
    return this.role === "public";
  }

  public canAccessPath(path: string, method: string): boolean {
    if (!this.isActive) return false;
    if (this.role === "admin" || this.role === "service") return true;

    // Public keys are strictly restricted to read-only map visual/search endpoints
    const normalizedMethod = method.toUpperCase();
    if (normalizedMethod !== "GET") return false;

    return (
      path.startsWith("/api/v1/map/tiles") ||
      path.startsWith("/api/v1/map/styles") ||
      path.startsWith("/api/v1/map/fonts") ||
      path.startsWith("/api/v1/map/autocomplete") ||
      path.startsWith("/api/v1/map/nearby") ||
      path.startsWith("/api/v1/map/reverse-geocode")
    );
  }

  public toJSON(): ApiKeyProps {
    return {
      id: this.id,
      name: this.name,
      key: this.key,
      role: this.role,
      rateLimit: this.rateLimit,
      allowedOrigins: this.allowedOrigins,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastUsedAt: this.lastUsedAt,
    };
  }
}
