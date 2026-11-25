import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const profile = readFileSync(
  resolve(process.cwd(), "docker/profiles/ethiopia-unified.lua"),
  "utf8",
);
const startScript = readFileSync(resolve(process.cwd(), "scripts/start.sh"), "utf8");

describe("OSRM routing profile", () => {
  it("applies access restrictions instead of only declaring them", () => {
    expect(profile).toContain("resolve_access = access.resolve_access");
    expect(profile).toContain("access_tags_hierarchy = Sequence {");
    expect(profile).toContain("if access_value and profile.access_tag_blacklist[access_value] then");
    expect(profile).toContain("if service and profile.service_tag_forbidden[service] then");
    expect(profile).toMatch(/['"]airport['"]/);
  });

  it("rebuilds the graph when the profile checksum changes", () => {
    expect(startScript).toContain("PROFILE_SUM=$(md5sum");
    expect(startScript).toContain("PROFILE_STAMP=\"${DATA_DIR}/routing-profile.md5\"");
    expect(startScript).toContain("rm -f \"${ROADS_OSRM}\".* \"${LATEST_OSRM}\".*");
  });
});
