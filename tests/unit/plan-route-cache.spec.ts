import { describe, it, expect } from "vitest";
import { PlanRouteUseCase } from "../../src/application/use-cases/plan-route.use-case";

describe("PlanRouteUseCase cached routes", () => {
  it("preserves OSRM snap distance when rehydrating a cached route", async () => {
    const cachedRoute = {
      id: "route_osrm_0",
      geometry: { type: "LineString", coordinates: [[38.7578, 8.9806], [38.799847, 8.984066]] },
      distance: { value: 6500, unit: "m" },
      duration: { value: 600, unit: "s" },
      waypoints: [
        {
          index: 0,
          coordinates: { latitude: 8.980449, longitude: 38.757688 },
          snapDistance: 20.75,
        },
        {
          index: 1,
          coordinates: { latitude: 8.984066, longitude: 38.799847 },
          snapDistance: 739.71,
        },
      ],
      steps: [],
      provider: "osrm",
    };
    const cache = { get: async () => [cachedRoute], set: async () => {} } as any;
    const provider = { route: async () => { throw new Error("provider should not be called"); } } as any;
    const logger = { info() {}, warn() {}, error() {}, debug() {} } as any;
    const eventBus = { publish: async () => {} } as any;
    const useCase = new PlanRouteUseCase(
      provider, cache, logger, {} as any, eventBus,
      undefined, undefined, undefined, "test-namespace",
    );

    const result = await useCase.execute({
      origin: { lat: 8.9806, lng: 38.7578 },
      destination: { lat: 8.9774, lng: 38.7993 },
      profile: "driving",
    });

    expect(result.cached).toBe(true);
    expect(result.routes[0].waypoints.map((wp) => wp.snapDistance)).toEqual([20.75, 739.71]);
  });
});
