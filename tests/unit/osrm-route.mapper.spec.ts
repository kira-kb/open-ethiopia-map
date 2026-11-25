import { describe, it, expect } from "vitest";
import { OsrmRouteMapper } from "../../src/infrastructure/providers/route/mappers/osrm-route.mapper";

describe("OsrmRouteMapper", () => {
  it("preserves OSRM snap distance so far endpoints can be detected", () => {
    const raw = {
      code: "Ok",
      routes: [
        {
          geometry: {
            type: "LineString",
            coordinates: [
              [38.7578, 8.9806],
              [38.795571, 8.983653],
            ],
          },
          legs: [],
          distance: 5200,
          duration: 900,
          weight: 900,
          weight_name: "duration",
        },
      ],
      waypoints: [
        {
          hint: "hint",
          location: [38.7578, 8.9806],
          name: "Meskel Square",
          distance: 4.2,
        },
        {
          hint: "hint",
          location: [38.795571, 8.983653],
          name: "",
          distance: 48.7,
        },
      ],
    };

    const routes = new OsrmRouteMapper().map(raw, "osrm");

    expect(routes).toHaveLength(1);
    expect(routes[0].waypoints.map((wp) => wp.snapDistance)).toEqual([4.2, 48.7]);
  });
});
