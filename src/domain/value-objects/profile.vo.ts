export enum RouteProfile {
  DRIVING = "driving",
  BAJAJ = "bajaj",
  CYCLING = "cycling",
  WALKING = "walking",
  MOTORCYCLE = "motorcycle",
}

const PROFILE_ALIASES: Record<string, RouteProfile> = {
  driving: RouteProfile.DRIVING,
  car: RouteProfile.DRIVING,
  automobile: RouteProfile.DRIVING,
  bajaj: RouteProfile.BAJAJ,
  auto: RouteProfile.BAJAJ,
  tuktuk: RouteProfile.BAJAJ,
  tuk_tuk: RouteProfile.BAJAJ,
  cycling: RouteProfile.CYCLING,
  bike: RouteProfile.CYCLING,
  bicycle: RouteProfile.CYCLING,
  walking: RouteProfile.WALKING,
  foot: RouteProfile.WALKING,
  pedestrian: RouteProfile.WALKING,
  motorcycle: RouteProfile.MOTORCYCLE,
  moto: RouteProfile.MOTORCYCLE,
  motorbike: RouteProfile.MOTORCYCLE,
};

export const SUPPORTED_PROFILES = Object.values(RouteProfile);

/**
 * Normalizes input profile strings (including aliases like 'car', 'bike', 'foot')
 * to canonical RouteProfile enum values.
 */
export function normalizeProfile(s: unknown): RouteProfile | undefined {
  if (typeof s !== "string" || !s.trim()) return undefined;
  const lower = s.trim().toLowerCase();
  return PROFILE_ALIASES[lower];
}

export function parseProfile(s: string): RouteProfile {
  const normalized = normalizeProfile(s);
  if (normalized) {
    return normalized;
  }
  throw new Error(
    `Invalid profile: "${s}". Supported: ${SUPPORTED_PROFILES.join(", ")} (aliases: car, bike, foot, moto, tuktuk)`,
  );
}
