import { describe, it, expect } from "vitest";
import { Coordinates, Distance, Duration, RouteProfile } from "../../src/domain/value-objects";
import { PackManRoute } from "../../src/domain/entities/route.entity";
import { EtaEnhancer } from "../../src/domain/services/routing/eta-enhancer";
import { EmergencyFallbackRouteProvider } from "../../src/infrastructure/providers/route/emergency-fallback.provider";

describe("Benchmark Ground-Truth Corridors (Addis Ababa + Gondar)", () => {
  const fallbackProvider = new EmergencyFallbackRouteProvider();
  const etaEnhancer = new EtaEnhancer();

  // ─── Addis Ababa Corridors ─────────────────────────────────────────

  it("Addis Corridor 1: Bole Airport to Kazanchis", async () => {
    const origin = new Coordinates(8.9806, 38.7578);
    const destination = new Coordinates(9.0195, 38.7710);

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "driving",
    });

    expect(result.routes.length).toBeGreaterThan(0);
    const route = result.routes[0];
    const distanceKm = route.distance.inMeters() / 1000;

    // Ground truth: ~5.5 km - 7.5 km
    expect(distanceKm).toBeGreaterThan(4.5);
    expect(distanceKm).toBeLessThan(8.5);

    const enhanced = etaEnhancer.enhance(route, RouteProfile.DRIVING);
    expect(enhanced.route.duration.inSeconds()).toBeGreaterThan(500);
  });

  it("Addis Corridor 2: Meskel Square to Megenagna with Peak Traffic", async () => {
    const origin = new Coordinates(9.0108, 38.7615); // Meskel Square
    const destination = new Coordinates(9.0210, 38.8020); // Megenagna

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "driving",
    });
    const route = result.routes[0];

    // Simulate Monday 8:30 AM Peak
    const mondayRush = new Date();
    mondayRush.setHours(8, 30, 0, 0);

    const enhanced = etaEnhancer.enhance(route, RouteProfile.DRIVING, mondayRush);

    // Congestion multiplier should increase travel duration
    expect(enhanced.traffic.delaySeconds).toBeGreaterThan(0);
    expect(enhanced.traffic.congestionLevel).not.toBe("low");
  });

  it("Addis Corridor 3: CMC Michael to Ayat Condominium", async () => {
    const origin = new Coordinates(9.0270, 38.8350);
    const destination = new Coordinates(9.0350, 38.8650);

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "driving",
    });
    const route = result.routes[0];
    const distanceKm = route.distance.inMeters() / 1000;

    expect(distanceKm).toBeGreaterThan(3.0);
    expect(distanceKm).toBeLessThan(6.5);
  });

  // ─── Gondar Corridors ─────────────────────────────────────────────

  it("Gondar Corridor 1: Azezo Bridge to Piassa with Bajaj Speed Clamp", async () => {
    const origin = new Coordinates(12.5350, 37.4380); // Azezo
    const destination = new Coordinates(12.6078, 37.4697); // Piassa

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "bajaj",
    });
    const route = result.routes[0];
    const distanceKm = route.distance.inMeters() / 1000;

    // Ground truth: ~10.5 km - 13.0 km
    expect(distanceKm).toBeGreaterThan(9.0);
    expect(distanceKm).toBeLessThan(14.0);

    const enhanced = etaEnhancer.enhance(route, RouteProfile.BAJAJ);

    // Bajaj speed limit: 30 km/h max on flat asphalt -> 10km takes >= 20 mins (1200s)
    const minutes = enhanced.route.duration.inSeconds() / 60;
    expect(minutes).toBeGreaterThanOrEqual(18);
  });

  it("Gondar Corridor 2: Arada to Kebele 18 (Cobblestone)", async () => {
    const origin = new Coordinates(12.6105, 37.4650);
    const destination = new Coordinates(12.6180, 37.4580);

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "bajaj",
    });
    const route = result.routes[0];

    expect(route.distance.inMeters()).toBeGreaterThan(800);
    expect(route.distance.inMeters()).toBeLessThan(2500);
  });

  it("Gondar Corridor 3: Posta Bet to Goha Hotel Incline", async () => {
    const origin = new Coordinates(12.6080, 37.4680);
    const destination = new Coordinates(12.6145, 37.4815);

    const result = await fallbackProvider.route({
      origin,
      destination,
      profile: "driving",
    });
    const route = result.routes[0];

    expect(route.distance.inMeters()).toBeGreaterThan(1200);
    expect(route.distance.inMeters()).toBeLessThan(3500);
  });
});
