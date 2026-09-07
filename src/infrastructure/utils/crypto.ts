import { createHash } from "crypto";

export const crypto = {
  md5(input: string): string {
    return createHash("md5").update(input).digest("hex");
  },

  sha256(input: string): string {
    return createHash("sha256").update(input).digest("hex");
  },
};
