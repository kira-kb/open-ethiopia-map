export enum RouteProfile {
  DRIVING = "driving",
  CYCLING = "cycling",
  WALKING = "walking",
  MOTORCYCLE = "motorcycle",
}

const VALID_PROFILES = new Set(Object.values(RouteProfile));

export function parseProfile(s: string): RouteProfile {
  const lower = s.toLowerCase();
  if (VALID_PROFILES.has(lower as RouteProfile)) {
    return lower as RouteProfile;
  }
  throw new Error(
    `Invalid profile: "${s}". Supported: ${Array.from(VALID_PROFILES).join(", ")}`,
  );
}
