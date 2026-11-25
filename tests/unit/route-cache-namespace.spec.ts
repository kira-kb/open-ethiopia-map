import { describe, it, expect } from "vitest";
import { PlanRouteUseCase } from "../../src/application/use-cases/plan-route.use-case";

function makeUseCase(namespace: string) {
  const keys: string[] = [];
  const cache = {
    get: async () => null,
    set: async (key: string) => {
      keys.push(key);
    },
  } as any;
  const provider = {
    route: async () => ({ routes: [], provider: "stub" }),
  } as any;
  const logger = { info() {}, warn() {}, error() {}, debug() {} } as any;
  const metrics = {} as any;
  const eventBus = { publish: async () => {} } as any;

  const useCase = new PlanRouteUseCase(
    provider, cache, logger, metrics, eventBus,
    undefined, undefined, undefined, namespace,
  );

  return { useCase, keys };
}

const command = {
  origin: { lat: 8.9806, lng: 38.7578 },
  destination: { lat: 8.9774, lng: 38.7993 },
  profile: "driving",
  steps: true,
};

describe("route cache namespace", () => {
  it("changes the cache key when the routing graph/profile changes", async () => {
    const before = makeUseCase("old-profile-checksum");
    const after = makeUseCase("new-profile-checksum");

    await before.useCase.execute(command);
    await after.useCase.execute(command);

    expect(before.keys).toHaveLength(1);
    expect(after.keys).toHaveLength(1);
    expect(after.keys[0]).not.toBe(before.keys[0]);
  });
});
