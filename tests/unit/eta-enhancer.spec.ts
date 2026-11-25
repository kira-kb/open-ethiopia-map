import { describe, it, expect } from "vitest";
import { EtaEnhancer } from "../../src/domain/services/routing/eta-enhancer";
import { PackManRoute } from "../../src/domain/entities/route.entity";
import { Distance, Duration, Coordinates, RouteProfile } from "../../src/domain/value-objects";
import { getActiveTrafficMultiplier } from "../../src/domain/services/traffic/rush-hour-matrix";

describe("EtaEnhancer & Rush-Hour Matrix", () => {
  const enhancer = new EtaEnhancer();

  function createTestRoute(
    distanceMeters: number,
    durationSeconds: number,
    coords: [number, number][],
    instructions: string[] = ["Turn left on Bole Road"],
  ): PackManRoute {
    const steps = instructions.map((instruction) => ({
      instruction,
      distance: new Distance(distanceMeters / instructions.length, "m"),
      duration: new Duration(durationSeconds / instructions.length, "s"),
      type: "turn",
      modifier: "left",
      geometry: { type: "LineString" as const, coordinates: coords },
    }));

    return new PackManRoute(
      "test_route_1",
      { type: "LineString", coordinates: coords },
      new Distance(distanceMeters, "m"),
      new Duration(durationSeconds, "s"),
      [],
      "osrm",
      steps,
    );
  }

  it("should clamp Bajaj duration to max 30 km/h speed limit", () => {
    // 10,000 meters route with unrealistic 600s (60 km/h) duration
    const fastCarRoute = createTestRoute(10000, 600, [[38.75, 9.0], [38.76, 9.01]]);

    const enhanced = enhancer.enhance(fastCarRoute, RouteProfile.BAJAJ);

    // 10,000m / 8.33 m/s = ~1200 seconds minimum for Bajaj
    expect(enhanced.route.duration.inSeconds()).toBeGreaterThanOrEqual(1200);
  });

  it("should apply surface drag for cobblestone (chigign) segments", () => {
    const asphaltRoute = createTestRoute(2000, 300, [[37.46, 12.60]], ["Continue on Asphalt Avenue"]);
    const cobblestoneRoute = createTestRoute(2000, 300, [[37.46, 12.60]], ["Turn onto Chigign Cobblestone Street"]);

    const enhancedAsphalt = enhancer.enhance(asphaltRoute, RouteProfile.DRIVING);
    const enhancedCobblestone = enhancer.enhance(cobblestoneRoute, RouteProfile.DRIVING);

    expect(enhancedCobblestone.route.duration.inSeconds()).toBeGreaterThan(
      enhancedAsphalt.route.duration.inSeconds(),
    );
    expect(enhancedCobblestone.roadDetails.cobblestonePercent).toBe(100);
  });

  it("should identify peak morning rush hour in Addis Ababa Gotera corridor", () => {
    // Monday at 08:30 AM
    const mondayMorningPeak = new Date("2026-11-23T08:30:00Z"); // Set local time hours
    mondayMorningPeak.setHours(8, 30, 0, 0);

    const goteraCoords: [number, number][] = [[38.755, 8.985]]; // Inside Gotera bbox

    const traffic = getActiveTrafficMultiplier(goteraCoords, mondayMorningPeak);

    expect(traffic.multiplier).toBeGreaterThanOrEqual(1.8);
    expect(traffic.zoneName).toBe("Gotera Interchange");
  });

  it("should return normal flow (1.0x) during late night off-peak hours", () => {
    const midnightOffPeak = new Date();
    midnightOffPeak.setHours(2, 0, 0, 0); // 2:00 AM

    const goteraCoords: [number, number][] = [[38.755, 8.985]];
    const traffic = getActiveTrafficMultiplier(goteraCoords, midnightOffPeak);

    expect(traffic.multiplier).toBe(1.0);
    expect(traffic.zoneName).toBeUndefined();
  });

  it("should detect Gondar Saturday market peak in Arada/Piassa", () => {
    // Saturday at 10:30 AM
    const saturdayMarketTime = new Date();
    // Force day to Saturday (6)
    const day = saturdayMarketTime.getDay();
    const diff = 6 - day;
    saturdayMarketTime.setDate(saturdayMarketTime.getDate() + diff);
    saturdayMarketTime.setHours(10, 30, 0, 0);

    const aradaCoords: [number, number][] = [[37.468, 12.608]]; // Inside Arada bbox
    const traffic = getActiveTrafficMultiplier(aradaCoords, saturdayMarketTime);

    expect(traffic.multiplier).toBeGreaterThanOrEqual(2.0);
    expect(traffic.zoneName).toContain("Gondar Arada Market");
  });

  it("should calibrate pedestrian walking pace to ~4.5 km/h", () => {
    // 1000m route with generic motor duration
    const route = createTestRoute(1000, 60, [[38.75, 9.0]]);
    const enhanced = enhancer.enhance(route, RouteProfile.WALKING);
    // 1000m / 1.25 m/s = 800 seconds (~13.3 mins)
    expect(enhanced.route.duration.inSeconds()).toBe(800);
  });

  it("should calibrate cycling pace to ~15 km/h", () => {
    // 3000m route
    const route = createTestRoute(3000, 100, [[38.75, 9.0]]);
    const enhanced = enhancer.enhance(route, RouteProfile.CYCLING);
    // 3000m / 4.17 m/s = ~720 seconds (~12 mins)
    expect(enhanced.route.duration.inSeconds()).toBeCloseTo(720, -1);
  });
});
