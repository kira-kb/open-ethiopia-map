import { describe, it, expect } from "vitest";
import { RouteProfile, parseProfile } from "../../src/domain/value-objects/profile.vo";
import { RouteRequestSchema } from "../../src/presentation/dto/route.dto";
import { CreateRouteSessionSchema } from "../../src/presentation/dto/route-session.dto";

describe("RouteProfile & Bajaj Support", () => {
  it("should have BAJAJ profile defined as 'bajaj'", () => {
    expect(RouteProfile.BAJAJ).toBe("bajaj");
  });

  it("should parse 'bajaj' in lowercase and uppercase", () => {
    expect(parseProfile("bajaj")).toBe(RouteProfile.BAJAJ);
    expect(parseProfile("BAJAJ")).toBe(RouteProfile.BAJAJ);
    expect(parseProfile("BaJaJ")).toBe(RouteProfile.BAJAJ);
  });

  it("should parse all other valid profiles", () => {
    expect(parseProfile("driving")).toBe(RouteProfile.DRIVING);
    expect(parseProfile("motorcycle")).toBe(RouteProfile.MOTORCYCLE);
    expect(parseProfile("walking")).toBe(RouteProfile.WALKING);
    expect(parseProfile("cycling")).toBe(RouteProfile.CYCLING);
  });

  it("should throw an error for unsupported profiles", () => {
    expect(() => parseProfile("helicopter")).toThrow(/Invalid profile/);
    expect(() => parseProfile("submarine")).toThrow(/Invalid profile/);
  });

  it("should accept 'bajaj' in RouteRequestSchema validation", () => {
    const validPayload = {
      origin: { lat: 12.6078, lng: 37.4697 },
      destination: { lat: 12.618, lng: 37.458 },
      profile: "bajaj",
    };

    const parsed = RouteRequestSchema.parse(validPayload);
    expect(parsed.profile).toBe("bajaj");
  });

  it("should accept 'bajaj' in CreateRouteSessionSchema validation", () => {
    const validSessionPayload = {
      deliveryId: "del_gondar_001",
      origin: { lat: 12.6078, lng: 37.4697 },
      destination: { lat: 12.618, lng: 37.458 },
      profile: "bajaj",
    };

    const parsed = CreateRouteSessionSchema.parse(validSessionPayload);
    expect(parsed.profile).toBe("bajaj");
  });

  it("should normalize documented profile aliases (car, bike, foot, moto, tuktuk)", () => {
    expect(parseProfile("car")).toBe(RouteProfile.DRIVING);
    expect(parseProfile("bike")).toBe(RouteProfile.CYCLING);
    expect(parseProfile("bicycle")).toBe(RouteProfile.CYCLING);
    expect(parseProfile("foot")).toBe(RouteProfile.WALKING);
    expect(parseProfile("pedestrian")).toBe(RouteProfile.WALKING);
    expect(parseProfile("moto")).toBe(RouteProfile.MOTORCYCLE);
    expect(parseProfile("tuktuk")).toBe(RouteProfile.BAJAJ);
  });

  it("should accept documented aliases in RouteRequestSchema without validation errors", () => {
    const carPayload = {
      origin: { lat: 9.0108, lng: 38.7615 },
      destination: { lat: 8.9806, lng: 38.7578 },
      profile: "car",
    };
    expect(RouteRequestSchema.parse(carPayload).profile).toBe("driving");

    const bikePayload = {
      origin: { lat: 9.0108, lng: 38.7615 },
      destination: { lat: 8.9806, lng: 38.7578 },
      profile: "bike",
    };
    expect(RouteRequestSchema.parse(bikePayload).profile).toBe("cycling");

    const footPayload = {
      origin: { lat: 9.0108, lng: 38.7615 },
      destination: { lat: 8.9806, lng: 38.7578 },
      profile: "foot",
    };
    expect(RouteRequestSchema.parse(footPayload).profile).toBe("walking");
  });
});
