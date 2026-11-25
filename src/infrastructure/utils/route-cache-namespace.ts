import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/**
 * Cache namespace derived from the OSRM routing profile.
 *
 * The graph is rebuilt whenever the Lua profile changes (see scripts/start.sh).
 * Including the same profile checksum in route cache keys prevents a freshly
 * rebuilt graph from continuing to serve routes cached under the old graph.
 */
export function routeCacheNamespace(): string {
  const candidates = [
    process.env.ROUTING_PROFILE_PATH,
    "/app/docker/profiles/ethiopia-unified.lua",
    resolve(process.cwd(), "docker/profiles/ethiopia-unified.lua"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) {
        return createHash("md5").update(readFileSync(candidate)).digest("hex");
      }
    } catch {
      // Try the next candidate path.
    }
  }

  return process.env.ROUTE_CACHE_VERSION || "unknown";
}
