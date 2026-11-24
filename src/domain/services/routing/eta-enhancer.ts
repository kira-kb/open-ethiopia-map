import { PackManRoute, RouteStep } from "../../entities/route.entity";
import { RouteProfile } from "../../value-objects/profile.vo";
import { Duration, Distance } from "../../value-objects";
import { getActiveTrafficMultiplier } from "../traffic/rush-hour-matrix";

export interface EnhancedRouteDetails {
  route: PackManRoute;
  traffic: {
    congestionLevel: "low" | "moderate" | "heavy" | "severe";
    delaySeconds: number;
    activeZone?: string;
  };
  roadDetails: {
    asphaltPercent: number;
    cobblestonePercent: number;
    unpavedPercent: number;
  };
}

export class EtaEnhancer {
  enhance(
    route: PackManRoute,
    profile: RouteProfile,
    currentTime: Date = new Date(),
  ): EnhancedRouteDetails {
    const coords = route.geometry.coordinates;
    const distanceMeters = route.distance.inMeters();
    let durationSeconds = route.duration.inSeconds();

    // 1. Vehicle-specific Speed Calibration for Bajaj
    // In Ethiopian cities, practical Bajaj speed is capped at 30 km/h (8.33 m/s)
    if (profile === RouteProfile.BAJAJ) {
      const minBajajSeconds = Math.round(distanceMeters / 8.33); // 30 km/h max speed cap
      if (durationSeconds < minBajajSeconds) {
        durationSeconds = minBajajSeconds;
      }
    }

    // 2. Road Surface Breakdown & Calibration
    let cobblestoneCount = 0;
    let unpavedCount = 0;
    const totalSteps = route.steps.length || 1;

    for (const step of route.steps) {
      const inst = (step.instruction || "").toLowerCase();
      if (inst.includes("cobblestone") || inst.includes("sett") || inst.includes("chigign")) {
        cobblestoneCount++;
      } else if (inst.includes("track") || inst.includes("dirt") || inst.includes("unpaved")) {
        unpavedCount++;
      }
    }

    const cobblestonePercent = Math.round((cobblestoneCount / totalSteps) * 100);
    const unpavedPercent = Math.round((unpavedCount / totalSteps) * 100);
    const asphaltPercent = Math.max(0, 100 - cobblestonePercent - unpavedPercent);

    // If cobblestone or unpaved sections exist, add surface drag factor
    const surfaceDragFactor = 1.0 + (cobblestonePercent * 0.004) + (unpavedPercent * 0.008);
    durationSeconds = Math.round(durationSeconds * surfaceDragFactor);

    // 3. Dynamic Traffic & Rush-Hour Multiplier
    const { multiplier, zoneName } = getActiveTrafficMultiplier(coords, currentTime);
    const trafficAdjustedSeconds = Math.round(durationSeconds * multiplier);
    const delaySeconds = trafficAdjustedSeconds - durationSeconds;

    let congestionLevel: "low" | "moderate" | "heavy" | "severe" = "low";
    if (multiplier >= 2.0) {
      congestionLevel = "severe";
    } else if (multiplier >= 1.6) {
      congestionLevel = "heavy";
    } else if (multiplier > 1.1) {
      congestionLevel = "moderate";
    }

    // 4. Update Route Object with Calibrated Duration
    const enhancedDuration = new Duration(trafficAdjustedSeconds, "s");
    const enhancedSteps: RouteStep[] = route.steps.map((s) => {
      const stepRatio = route.duration.inSeconds() > 0
        ? s.duration.inSeconds() / route.duration.inSeconds()
        : 1 / totalSteps;
      const stepDur = Math.max(1, Math.round(trafficAdjustedSeconds * stepRatio));
      return {
        ...s,
        duration: new Duration(stepDur, "s"),
      };
    });

    const enhancedRoute = new PackManRoute(
      route.id,
      route.geometry,
      route.distance,
      enhancedDuration,
      route.waypoints,
      route.provider,
      enhancedSteps,
    );

    return {
      route: enhancedRoute,
      traffic: {
        congestionLevel,
        delaySeconds,
        activeZone: zoneName,
      },
      roadDetails: {
        asphaltPercent,
        cobblestonePercent,
        unpavedPercent,
      },
    };
  }
}
