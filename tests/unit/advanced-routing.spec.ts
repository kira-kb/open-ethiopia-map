import { describe, it, expect } from "vitest";
import { CityGuard } from "../../src/domain/services/routing/city-guard";
import { RoadRestrictionService } from "../../src/domain/services/routing/road-restriction.service";
import { Coordinates, RouteProfile } from "../../src/domain/value-objects";
import { EmergencyFallbackRouteProvider } from "../../src/infrastructure/providers/route/emergency-fallback.provider";

describe("Advanced Routing Hardening (CityGuard, Restrictions & Emergency Fallback)", () => {
  const cityGuard = new CityGuard();
  const restrictionService = new RoadRestrictionService();
  const fallbackProvider = new EmergencyFallbackRouteProvider();

  it("should detect Addis Ababa and warn against illegal Bajaj usage in central subcities", () => {
    const bole = new Coordinates(8.9806, 38.7578);
    const kazanchis = new Coordinates(9.0195, 38.7710);

    const result = cityGuard.validateProfileForRegion(bole, kazanchis, RouteProfile.BAJAJ);

    expect(result.city).toBe("addis_ababa");
    expect(result.isLegalProfile).toBe(false);
    expect(result.warning).toContain("legally restricted");
    expect(result.suggestedProfile).toBe(RouteProfile.MOTORCYCLE);
  });

  it("should detect Gondar and permit unrestricted Bajaj usage", () => {
    const azezo = new Coordinates(12.5350, 37.4380);
    const piassa = new Coordinates(12.6078, 37.4697);

    const result = cityGuard.validateProfileForRegion(azezo, piassa, RouteProfile.BAJAJ);

    expect(result.city).toBe("gondar");
    expect(result.isLegalProfile).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("should identify Corridor Project road restrictions in Piassa-4Kilo zone", () => {
    const piassaCoordinates: [number, number][] = [
      [38.7550, 9.0340], // Inside Piassa-4Kilo reconstruction corridor
      [38.7580, 9.0360],
    ];

    const check = restrictionService.checkRouteRestrictions(piassaCoordinates);

    expect(check.hasRestrictions).toBe(true);
    expect(check.isBlocked).toBe(true);
    expect(check.violatingZones[0].name).toContain("Piassa to 4 Kilo");
  });

  it("should permit routes through normal unrestricted roads", () => {
    const boleRoadCoordinates: [number, number][] = [
      [38.7890, 8.9910],
      [38.7895, 8.9920],
    ];

    const check = restrictionService.checkRouteRestrictions(boleRoadCoordinates);

    expect(check.hasRestrictions).toBe(false);
    expect(check.isBlocked).toBe(false);
  });

  it("Emergency Fallback should route through intermediate urban arterial spines for long trips", async () => {
    const bole = new Coordinates(8.9806, 38.7850);
    const torHailoch = new Coordinates(9.0150, 38.7200);

    const res = await fallbackProvider.route({
      origin: bole,
      destination: torHailoch,
      profile: "driving",
    });

    expect(res.routes.length).toBe(1);
    const route = res.routes[0];

    // For > 2.5km trip, points must be expanded with arterial junctions
    expect(route.waypoints.length).toBeGreaterThan(2);
    expect(route.distance.inMeters()).toBeGreaterThan(5000);
  });
});
