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

    // 1. Vehicle / Mode specific Speed Calibration
    if (profile === RouteProfile.BAJAJ) {
      // In Ethiopian cities, practical Bajaj speed is capped at 30 km/h (8.33 m/s)
      const minBajajSeconds = Math.round(distanceMeters / 8.33);
      if (durationSeconds < minBajajSeconds) {
        durationSeconds = minBajajSeconds;
      }
    } else if (profile === RouteProfile.WALKING) {
      // Pedestrian average walking pace: 4.5 km/h (1.25 m/s)
      durationSeconds = Math.max(1, Math.round(distanceMeters / 1.25));
    } else if (profile === RouteProfile.CYCLING) {
      // Bicycle average city speed: 15 km/h (4.17 m/s)
      durationSeconds = Math.max(1, Math.round(distanceMeters / 4.17));
    } else if (profile === RouteProfile.MOTORCYCLE) {
      // Motorcycle: agile in dense urban traffic
      const minMotoSeconds = Math.round(distanceMeters / 11.11); // 40 km/h cap
      durationSeconds = Math.max(minMotoSeconds, Math.round(durationSeconds * 0.9));
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

    // Apply surface drag factor according to mode of transit
    if (profile === RouteProfile.WALKING) {
      const walkingSurfaceFactor = 1.0 + (unpavedPercent * 0.002);
      durationSeconds = Math.round(durationSeconds * walkingSurfaceFactor);
    } else if (profile === RouteProfile.CYCLING) {
      const cyclingSurfaceFactor = 1.0 + (cobblestonePercent * 0.003) + (unpavedPercent * 0.006);
      durationSeconds = Math.round(durationSeconds * cyclingSurfaceFactor);
    } else {
      const surfaceDragFactor = 1.0 + (cobblestonePercent * 0.004) + (unpavedPercent * 0.008);
      durationSeconds = Math.round(durationSeconds * surfaceDragFactor);
    }

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
