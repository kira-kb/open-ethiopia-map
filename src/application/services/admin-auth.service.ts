import crypto from "crypto";
import { ApiKeyStore } from "../../infrastructure/database/api-key.store";

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

export class AdminAuthService {
  private secret: string;

  constructor(
    private readonly apiKeyStore: ApiKeyStore,
    secret?: string
  ) {
    this.secret = secret || process.env.ADMIN_JWT_SECRET || "ethiopia_map_admin_portal_secret_key_2026";
  }

  public login(email: string, pass: string): { token: string; user: { email: string; role: string } } | null {
    const isValid = this.apiKeyStore.verifyAdminCredentials(email, pass);
    if (!isValid) {
      return null;
    }

    const payload: AdminTokenPayload = {
      email: email.trim().toLowerCase(),
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 days
    };

    const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(payloadStr)
      .digest("base64url");

    return {
      token: `${payloadStr}.${signature}`,
      user: {
        email: payload.email,
        role: "admin",
      },
    };
  }

  public verifyToken(token: string): AdminTokenPayload | null {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", this.secret)
      .update(payloadStr)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    try {
      const payload: AdminTokenPayload = JSON.parse(
        Buffer.from(payloadStr, "base64url").toString("utf-8")
      );
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }
}
