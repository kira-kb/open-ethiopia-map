/**
 * Self-Hosted OpenMapTiles Vector Style Generator for MapLibre GL
 * Matches Gebeta Maps / OpenMapTiles Vector Styling with full Amharic (name:am) & English (name:en) support.
 */

export interface StyleOptions {
  baseUrl: string;
  style?: "dark" | "light" | "voyager" | "street" | string;
  lang?: "en" | "am" | "default";
  /**
   * Opt in to color-coded major roads (motorway/trunk/primary/secondary).
   * Default is false: every road uses one neutral color, like mapcn.dev.
   */
  showMainRoads?: boolean;
}

export function generateVectorStyle(options: StyleOptions): any {
  const { baseUrl, style = "dark", lang = "default", showMainRoads = false } = options;
  const isDark = style === "dark";

  // Dynamic text expression preferring user language
  const textField =
    lang === "am"
      ? ["coalesce", ["get", "name:am"], ["get", "name:en"], ["get", "name"], ""]
      : lang === "en"
      ? ["coalesce", ["get", "name:en"], ["get", "name:am"], ["get", "name"], ""]
      : ["coalesce", ["get", "name:am"], ["get", "name:en"], ["get", "name"], ""];

  // Color schemes. Default keeps all roads neutral (mapcn-like); the original
  // bright hierarchy is available only when explicitly requested.
  const baseColors = isDark
    ? {
        background: "#0b0f19",
        landcover: "#0f172a",
        park: "#0e2a22",
        parkOutline: "#134e4a",
        water: "#1e293b",
        waterOutline: "#0f172a",
        waterway: "#38bdf8",
        building: "#172033",
        buildingOutline: "#1e293b",
        building3D: "#1e293b",
        boundary: "#475569",
        tunnel: "#111827",
        roadMotorwayCasing: "#1e293b",
        roadMotorway: "#414758",
        roadTrunkCasing: "#1e293b",
        roadTrunk: "#414758",
        roadPrimary: "#414758",
        roadSecondary: "#414758",
        roadTertiary: "#414758",
        roadMinor: "#414758",
        roadService: "#414758",
        roadLabel: "#cbd5e1",
        roadLabelHalo: "#0b0f19",
        placeCity: "#f8fafc",
        placeTown: "#e2e8f0",
        placeVillage: "#cbd5e1",
        placeLabelHalo: "#0f172a",
        aeroway: "#1e293b",
      }
    : {
        background: "#f8fafc",
        landcover: "#f1f5f9",
        park: "#dcfce7",
        parkOutline: "#bbf7d0",
        water: "#bae6fd",
        waterOutline: "#7dd3fc",
        waterway: "#0284c7",
        building: "#e2e8f0",
        buildingOutline: "#cbd5e1",
        building3D: "#cbd5e1",
        boundary: "#94a3b8",
        tunnel: "#f1f5f9",
        roadMotorwayCasing: "#e2e8f0",
        roadMotorway: "#cbd5e1",
        roadTrunkCasing: "#e2e8f0",
        roadTrunk: "#cbd5e1",
        roadPrimary: "#cbd5e1",
        roadSecondary: "#cbd5e1",
        roadTertiary: "#cbd5e1",
        roadMinor: "#cbd5e1",
        roadService: "#cbd5e1",
        roadLabel: "#1e293b",
        roadLabelHalo: "#ffffff",
        placeCity: "#0f172a",
        placeTown: "#1e293b",
        placeVillage: "#334155",
        placeLabelHalo: "#ffffff",
        aeroway: "#e2e8f0",
      };

  const roadHierarchyColors = isDark
    ? {
        roadMotorwayCasing: "#b45309",
        roadMotorway: "#f59e0b",
        roadTrunkCasing: "#b45309",
        roadTrunk: "#fbbf24",
        roadPrimary: "#38bdf8",
        roadSecondary: "#0284c7",
      }
    : {
        roadMotorwayCasing: "#c2410c",
        roadMotorway: "#ea580c",
        roadTrunkCasing: "#c2410c",
        roadTrunk: "#f97316",
        roadPrimary: "#0284c7",
        roadSecondary: "#0369a1",
      };

  const colors = showMainRoads ? { ...baseColors, ...roadHierarchyColors } : baseColors;

  const SOURCE_ID = "openmaptiles";

  return {
    version: 8,
    name: `Open Ethiopia Map - ${style.charAt(0).toUpperCase() + style.slice(1)}`,
    metadata: {
      "openethiopiamap:version": "2.0.0",
      "openethiopiamap:style": style,
      "openethiopiamap:engine": "planetiler-vector",
      "openethiopiamap:schema": "openmaptiles",
      "openethiopiamap:main-roads": showMainRoads ? "colored" : "uniform",
    },
    sources: {
      [SOURCE_ID]: {
        type: "vector",
        tiles: [`${baseUrl}/api/v1/map/tiles/vector/{z}/{x}/{y}.mvt`],
        minzoom: 0,
        maxzoom: 14,
        attribution: "Open Ethiopia Map",
      },
    },
    glyphs: `${baseUrl}/api/v1/map/fonts/{fontstack}/{range}.pbf`,
    layers: [
      // 1. Background
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": colors.background,
        },
      },

      // 2. Landcover & Parks
      {
        id: "landcover",
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "landcover",
        paint: {
          "fill-color": colors.landcover,
          "fill-opacity": 0.8,
        },
      },
      {
        id: "landuse-park",
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "park",
        paint: {
          "fill-color": colors.park,
          "fill-outline-color": colors.parkOutline,
          "fill-opacity": 0.85,
        },
      },

      // 3. Water Polygons & Waterways
      {
        id: "water",
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "water",
        paint: {
          "fill-color": colors.water,
          "fill-outline-color": colors.waterOutline,
        },
      },
      {
        id: "waterway",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "waterway",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": colors.waterway,
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 14, 2.5],
        },
      },

      // 4. Aeroway (Airports, Runways)
      {
        id: "aeroway-runway",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "aeroway",
        filter: ["==", "class", "runway"],
        paint: {
          "line-color": colors.aeroway,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 16, 8],
        },
      },

      // 5. Buildings (2D Footprints)
      {
        id: "building",
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": colors.building,
          "fill-outline-color": colors.buildingOutline,
          "fill-opacity": 0.85,
        },
      },

      // 6. 3D Building Extrusions (Active when pitched/tilted)
      {
        id: "building-3d",
        type: "fill-extrusion",
        source: SOURCE_ID,
        "source-layer": "building",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": colors.building3D,
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            14.5,
            ["coalesce", ["get", "render_height"], 12],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            14.5,
            ["coalesce", ["get", "render_min_height"], 0],
          ],
          "fill-extrusion-opacity": 0.9,
        },
      },

      // 7. Boundaries (Country & Region borders)
      {
        id: "admin-boundary",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "boundary",
        layout: {
          "line-join": "round",
        },
        paint: {
          "line-color": colors.boundary,
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 10, 2],
          "line-dasharray": [3, 2],
        },
      },

      // 8. Road Network by Hierarchy
      // Service / Compound / Alleyways
      {
        id: "road-service",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["in", "class", "service", "track"],
        minzoom: 13,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadService,
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 0.8, 17, 3],
        },
      },

      // Minor / Residential Streets
      {
        id: "road-minor",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "residential", "unclassified", "living_street"],
        minzoom: 11,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadMinor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.8, 14, 2, 17, 5],
        },
      },

      // Secondary & Tertiary City Roads
      {
        id: "road-secondary-tertiary",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        minzoom: 8,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadSecondary,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3, 17, 7],
          "line-opacity": showMainRoads ? 0.6 : 1,
        },
      },

      // Primary Arteries & Avenues (e.g. Bole Road)
      {
        id: "road-primary",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["==", "class", "primary"],
        minzoom: 6,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadPrimary,
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 1.2, 12, 3.5, 17, 9],
          "line-opacity": showMainRoads ? 0.6 : 1,
        },
      },

      // Trunk & Expressways (e.g. Debre Zeit Road, Ring Road)
      {
        id: "road-trunk",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["==", "class", "trunk"],
        minzoom: 5,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadTrunk,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.5, 11, 4, 17, 10],
          "line-opacity": showMainRoads ? 0.6 : 1,
        },
      },

      // Motorway
      {
        id: "road-motorway",
        type: "line",
        source: SOURCE_ID,
        "source-layer": "transportation",
        filter: ["==", "class", "motorway"],
        minzoom: 4,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.roadMotorway,
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.8, 11, 5, 17, 11],
          "line-opacity": showMainRoads ? 0.6 : 1,
        },
      },

      // 9. Street & Avenue Labels
      {
        id: "road-name",
        type: "symbol",
        source: SOURCE_ID,
        "source-layer": "transportation_name",
        minzoom: 12,
        layout: {
          "symbol-placement": "line",
          "text-field": textField,
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 9, 16, 13],
          "text-font": ["Noto Sans Regular"],
          "text-letter-spacing": 0.05,
          "text-max-angle": 30,
        },
        paint: {
          "text-color": colors.roadLabel,
          "text-halo-color": colors.roadLabelHalo,
          "text-halo-width": 1.5,
        },
      },

      // 10. Place Labels (Cities, Towns, Neighborhoods)
      {
        id: "place-suburb",
        type: "symbol",
        source: SOURCE_ID,
        "source-layer": "place",
        filter: ["in", "class", "suburb", "neighbourhood", "village"],
        minzoom: 11,
        layout: {
          "text-field": textField,
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10, 16, 14],
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          "text-color": colors.placeVillage,
          "text-halo-color": colors.placeLabelHalo,
          "text-halo-width": 1.5,
        },
      },
      {
        id: "place-town",
        type: "symbol",
        source: SOURCE_ID,
        "source-layer": "place",
        filter: ["==", "class", "town"],
        minzoom: 8,
        layout: {
          "text-field": textField,
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 12, 14, 16],
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          "text-color": colors.placeTown,
          "text-halo-color": colors.placeLabelHalo,
          "text-halo-width": 2,
        },
      },
      {
        id: "place-city",
        type: "symbol",
        source: SOURCE_ID,
        "source-layer": "place",
        filter: ["in", "class", "city", "country"],
        minzoom: 4,
        layout: {
          "text-field": textField,
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 13, 10, 18, 14, 22],
          "text-font": ["Noto Sans Regular"],
          "text-transform": "uppercase",
        },
        paint: {
          "text-color": colors.placeCity,
          "text-halo-color": colors.placeLabelHalo,
          "text-halo-width": 2.5,
        },
      },
    ],
  };
}
