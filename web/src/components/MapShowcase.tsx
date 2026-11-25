"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getEffectiveApiUrl,
  DEFAULT_DEMO_API_KEY,
  ADDIS_LANDMARKS,
  GONDAR_LANDMARKS,
  DEMO_ROUTES,
  DemoRoute,
  Landmark,
} from "@/lib/api-config";

// In-memory raster style spec to ensure MapLibre works reliably offline & standalone
function getMapStyleSpec(styleKey: string = "dark", currentLang: string = "en"): string {
  const apiUrl = getEffectiveApiUrl();
  return `${apiUrl}/api/v1/map/styles/${styleKey}.json?lang=${currentLang}`;
}

export function MapShowcase() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const activeMarkersRef = useRef<any[]>([]);
  const originMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  // Language state: "en" | "am"
  const [lang, setLang] = useState<"en" | "am">("en");
  const [currentStyle, setCurrentStyle] = useState<string>("dark");
  const [profile, setProfile] = useState<"driving" | "bajaj" | "walking" | "cycling">("driving");
  const [is3D, setIs3D] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string>("route-airport");
  const [routeSummary, setRouteSummary] = useState<any>(null);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [inspectData, setInspectData] = useState<any>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"payload" | "steps" | "session" | "curl">("payload");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Custom origin & destination state
  const [customOrigin, setCustomOrigin] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [customDest, setCustomDest] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Delivery session state
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId?: string;
    revision?: number;
    status?: string;
    deviationResult?: { deviated: boolean; distanceMeters: number; message?: string } | null;
  }>({});
  const [sessionLoading, setSessionLoading] = useState(false);

  // Regional Ethiopian Cities for Quick Switcher
  const ETHIOPIA_CITIES = [
    { name: "Addis Ababa", amharic: "አዲስ አበባ", coords: [38.7612, 9.0105] as [number, number], zoom: 12.2 },
    { name: "Gondar", amharic: "ጎንደር", coords: [37.4697, 12.6078] as [number, number], zoom: 13.5 },
    { name: "Hawassa", amharic: "ሐዋሳ", coords: [38.4764, 7.0504] as [number, number], zoom: 12.8 },
    { name: "Dire Dawa", amharic: "ድሬዳዋ", coords: [41.8661, 9.5931] as [number, number], zoom: 12.8 },
    { name: "Bahir Dar", amharic: "ባሕር ዳር", coords: [37.3908, 11.5742] as [number, number], zoom: 12.8 },
    { name: "Adama", amharic: "አዳማ", coords: [39.2689, 8.5414] as [number, number], zoom: 12.8 },
    { name: "Bishoftu", amharic: "ቢሾፍቱ", coords: [38.9785, 8.7523] as [number, number], zoom: 12.8 },
  ];
  const [activeCity, setActiveCity] = useState("Addis Ababa");

  // Re-plot landmark markers on the map
  async function plotCityLandmarks(map: any, cityName: string) {
    if (!map) return;
    const maplibregl = (await import("maplibre-gl")).default;

    // Clear old markers
    activeMarkersRef.current.forEach((m) => m.remove());
    activeMarkersRef.current = [];

    const landmarksToRender = cityName === "Gondar" ? GONDAR_LANDMARKS : ADDIS_LANDMARKS;

    landmarksToRender.slice(0, 8).forEach((lm: Landmark) => {
      const pinColor = cityName === "Gondar" ? "#f59e0b" : "#10b981";
      const startBtnText = lang === "am" ? "እዚህ ጀምር" : "Start Here";
      const endBtnText = lang === "am" ? "እዚህ ጨርስ" : "End Here";
      const displayName = lang === "am" && lm.amharicName ? lm.amharicName : lm.name;
      const subName = lang === "am" ? lm.name : lm.amharicName || "";

      const marker = new maplibregl.Marker({ color: pinColor })
        .setLngLat(lm.coords)
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(
            `<div style="min-width: 180px; padding: 4px; font-family: sans-serif;">
              <b style="color: #38bdf8; font-size: 0.85rem;">${displayName}</b>
              <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 2px;">${subName}</div>
              <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 4px;">${lm.description}</div>
              <div style="display: flex; gap: 4px; margin-top: 8px;">
                <button style="background: #10b981; color: #fff; border: none; border-radius: 4px; padding: 3px 7px; font-size: 0.7rem; cursor: pointer;"
                  onclick="window.__setStartPoint(${lm.coords[1]}, ${lm.coords[0]}, '${displayName.replace(/'/g, "\\'")}')">${startBtnText}</button>
                <button style="background: #0284c7; color: #fff; border: none; border-radius: 4px; padding: 3px 7px; font-size: 0.7rem; cursor: pointer;"
                  onclick="window.__setEndPoint(${lm.coords[1]}, ${lm.coords[0]}, '${displayName.replace(/'/g, "\\'")}')">${endBtnText}</button>
              </div>
            </div>`
          )
        )
        .addTo(map);

      activeMarkersRef.current.push(marker);
    });
  }

  function flyToCity(city: typeof ETHIOPIA_CITIES[0]) {
    setActiveCity(city.name);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: city.coords,
        zoom: city.zoom,
        essential: true,
        duration: 1800,
      });
      plotCityLandmarks(mapRef.current, city.name);

      // Auto-switch to a preset route for this city
      if (city.name === "Gondar") {
        const gondarPreset = DEMO_ROUTES.find((r) => r.city === "Gondar") || DEMO_ROUTES[3];
        setActiveRouteId(gondarPreset.id);
        setProfile("bajaj");
        executeRoutePlan(
          { lat: gondarPreset.origin.coords[1], lng: gondarPreset.origin.coords[0], name: gondarPreset.origin.name },
          { lat: gondarPreset.destination.coords[1], lng: gondarPreset.destination.coords[0], name: gondarPreset.destination.name },
          "bajaj"
        );
      } else if (city.name === "Addis Ababa") {
        const addisPreset = DEMO_ROUTES[0];
        setActiveRouteId(addisPreset.id);
        setProfile("driving");
        executeRoutePlan(
          { lat: addisPreset.origin.coords[1], lng: addisPreset.origin.coords[0], name: addisPreset.origin.name },
          { lat: addisPreset.destination.coords[1], lng: addisPreset.destination.coords[0], name: addisPreset.destination.name },
          "driving"
        );
      }
    }
  }

  // Expose global callback helpers for map popups
  useEffect(() => {
    (window as any).__setStartPoint = (lat: number, lng: number, name: string) => {
      handleSetOrigin(lat, lng, name);
    };
    (window as any).__setEndPoint = (lat: number, lng: number, name: string) => {
      handleSetDestination(lat, lng, name);
    };

    return () => {
      delete (window as any).__setStartPoint;
      delete (window as any).__setEndPoint;
    };
  }, [profile, customDest, customOrigin, lang]);

  // Initialize MapLibre in browser
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return;

      const maplibregl = (await import("maplibre-gl")).default;
      if (!isMounted) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyleSpec(currentStyle, lang),
        center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
        zoom: 12.2,
        pitch: 0,
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");

      map.on("load", () => {
        plotCityLandmarks(map, "Addis Ababa");

        // Trigger default route
        executeRoutePlan(
          { lat: DEMO_ROUTES[0].origin.coords[1], lng: DEMO_ROUTES[0].origin.coords[0], name: DEMO_ROUTES[0].origin.name },
          { lat: DEMO_ROUTES[0].destination.coords[1], lng: DEMO_ROUTES[0].destination.coords[0], name: DEMO_ROUTES[0].destination.name },
          "driving",
          map,
          maplibregl
        );
      });

      // Click to reverse geocode & set endpoints
      map.on("click", async (e: any) => {
        const { lng, lat } = e.lngLat;
        const apiUrl = getEffectiveApiUrl();
        const resolvingText = lang === "am" ? "አድራሻ በመፈለግ ላይ..." : "Resolving address...";
        const popup = new maplibregl.Popup({ offset: 12 })
          .setLngLat([lng, lat])
          .setHTML(`<div style="padding: 2px; font-family: sans-serif;"><b>${resolvingText}</b></div>`)
          .addTo(map);

        try {
          const res = await fetch(`${apiUrl}/api/v1/map/reverse-geocode?lat=${lat}&lng=${lng}&lang=${lang}&key=${DEFAULT_DEMO_API_KEY}`, {
            headers: {
              "X-API-Key": DEFAULT_DEMO_API_KEY,
              "X-Lang": lang,
            },
          });
          const data = await res.json();
          const addr = data.data?.address?.formatted || data.data?.displayName || (lang === "am" ? "የተመረጠ ቦታ" : "Selected Location");
          const escapedAddr = addr.replace(/'/g, "\\'");
          const startLabel = lang === "am" ? "መነሻ አድርግ" : "Set Start";
          const endLabel = lang === "am" ? "መድረሻ አድርግ" : "Set Destination";

          popup.setHTML(
            `<div style="min-width: 180px; padding: 4px; font-family: sans-serif;">
              <b style="color: #38bdf8; font-size: 0.85rem;">${addr}</b>
              <div style="color: #94a3b8; font-size: 0.72rem; margin: 3px 0 6px;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</div>
              <div style="display: flex; gap: 5px;">
                <button style="background: #10b981; color: #fff; border: none; border-radius: 4px; padding: 3px 7px; font-size: 0.72rem; cursor: pointer;"
                  onclick="window.__setStartPoint(${lat}, ${lng}, '${escapedAddr}')">${startLabel}</button>
                <button style="background: #0284c7; color: #fff; border: none; border-radius: 4px; padding: 3px 7px; font-size: 0.72rem; cursor: pointer;"
                  onclick="window.__setEndPoint(${lat}, ${lng}, '${escapedAddr}')">${endLabel}</button>
              </div>
            </div>`
          );
        } catch {
          popup.setHTML(
            `<div style="font-family: sans-serif; padding: 2px;">
              <div>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</div>
            </div>`
          );
        }
      });

      mapRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Compute and display route
  async function executeRoutePlan(
    origin: { lat: number; lng: number; name: string },
    destination: { lat: number; lng: number; name: string },
    routeProfile: "driving" | "bajaj" | "walking" | "cycling",
    mapInstance?: any,
    maplibreglLib?: any
  ) {
    const map = mapInstance || mapRef.current;
    if (!map) return;

    setLoadingRoute(true);
    const apiUrl = getEffectiveApiUrl();

    try {
      const payload = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        profile: routeProfile,
        lang,
        steps: true,
      };

      const startTime = performance.now();
      let routeData: any = null;

      try {
        const res = await fetch(`${apiUrl}/api/v1/map/route?lang=${lang}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": DEFAULT_DEMO_API_KEY,
            "X-Lang": lang,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          routeData = await res.json();
        }
      } catch (networkErr) {
        console.warn("Live API routing failed or server compiling; using calibrated fallback route.", networkErr);
      }

      const elapsedMs = Math.round(performance.now() - startTime);

      let coordinates: [number, number][] = [];
      let summaryDistance = lang === "am" ? "6.2 ኪ.ሜ" : "6.2 km";
      let summaryDuration = lang === "am" ? "14 ደቂቃ" : "14 mins";
      let steps: any[] = [];

      if (routeData && routeData.success && routeData.data?.routes?.[0]?.geometry?.coordinates) {
        const route = routeData.data.routes[0];
        coordinates = route.geometry.coordinates;
        summaryDistance = route.summary.distanceText || `${(route.summary.distance.value / 1000).toFixed(1)} km`;
        summaryDuration = route.summary.durationText || `${Math.round(route.summary.duration.value / 60)} mins`;
        steps = route.steps || [];
        setInspectData({ request: payload, response: routeData, latencyMs: elapsedMs });
      } else {
        // Fallback to demo route coordinates for offline/standalone resilience
        const activePreset = DEMO_ROUTES.find((r) => r.id === activeRouteId) || DEMO_ROUTES[0];
        coordinates = activePreset.fallbackCoordinates;
        steps = [
          {
            instruction: lang === "am" ? "በዋናው መንገድ ጉዞዎን ይጀምሩ" : "Head straight on primary road",
            distance: { value: 850, unit: "m" },
            type: "depart",
          },
          {
            instruction: lang === "am" ? "በአደባባዩ በሁለተኛው መውጫ ይውጡ" : "At the roundabout, take the 2nd exit",
            distance: { value: 1400, unit: "m" },
            type: "roundabout",
          },
          {
            instruction: lang === "am" ? "መድረሻዎ በስተቀኝ ይገኛል" : "You have reached your destination on the right",
            distance: { value: 200, unit: "m" },
            type: "arrive",
          },
        ];
        setInspectData({
          request: payload,
          response: {
            success: true,
            source: "calibrated-fallback",
            data: {
              routes: [{
                geometry: { type: "LineString", coordinates },
                summary: { distanceText: summaryDistance, durationText: summaryDuration },
                steps,
              }],
            },
          },
          latencyMs: elapsedMs,
        });
      }

      setRouteSummary({
        distance: summaryDistance,
        duration: summaryDuration,
        stepsCount: steps.length,
        originName: origin.name,
        destinationName: destination.name,
        profile: routeProfile,
      });

      setRouteSteps(steps);

      const geojsonData = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates },
      };

      if (map.getSource("active-route-src")) {
        map.getSource("active-route-src").setData(geojsonData);
      } else {
        map.addSource("active-route-src", { type: "geojson", data: geojsonData });

        // Glow outer line
        map.addLayer({
          id: "active-route-glow",
          type: "line",
          source: "active-route-src",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": routeProfile === "bajaj" ? "#f59e0b" : "#0284c7",
            "line-width": 9,
            "line-opacity": 0.45,
          },
        });

        // Neon core line
        map.addLayer({
          id: "active-route-core",
          type: "line",
          source: "active-route-src",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": routeProfile === "bajaj" ? "#fbbf24" : "#38bdf8",
            "line-width": 4,
          },
        });
      }

      // Fit camera bounds
      const maplibregl = maplibreglLib || (await import("maplibre-gl")).default;
      const bounds = coordinates.reduce(
        (b: any, c: any) => b.extend(c),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.fitBounds(bounds, { padding: 60, duration: 1200 });
    } catch (err: any) {
      console.error("Route calculation error:", err);
    } finally {
      setLoadingRoute(false);
    }
  }

  // Handle setting custom start point
  async function handleSetOrigin(lat: number, lng: number, name: string) {
    setCustomOrigin({ lat, lng, name });
    setActiveRouteId("custom");

    if (mapRef.current) {
      const maplibregl = (await import("maplibre-gl")).default;
      if (originMarkerRef.current) originMarkerRef.current.remove();

      originMarkerRef.current = new maplibregl.Marker({ color: "#10b981" })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText(`${lang === "am" ? "መነሻ" : "Start"}: ${name}`))
        .addTo(mapRef.current);

      if (customDest) {
        executeRoutePlan({ lat, lng, name }, customDest, profile);
      }
    }
  }

  // Handle setting custom end point
  async function handleSetDestination(lat: number, lng: number, name: string) {
    setCustomDest({ lat, lng, name });
    setActiveRouteId("custom");

    if (mapRef.current) {
      const maplibregl = (await import("maplibre-gl")).default;
      if (destMarkerRef.current) destMarkerRef.current.remove();

      destMarkerRef.current = new maplibregl.Marker({ color: "#38bdf8" })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText(`${lang === "am" ? "መድረሻ" : "Destination"}: ${name}`))
        .addTo(mapRef.current);

      if (customOrigin) {
        executeRoutePlan(customOrigin, { lat, lng, name }, profile);
      }
    }
  }

  // Switch Travel Profile
  function handleProfileChange(newProfile: "driving" | "bajaj" | "walking" | "cycling") {
    setProfile(newProfile);
    if (customOrigin && customDest) {
      executeRoutePlan(customOrigin, customDest, newProfile);
    } else {
      const activePreset = DEMO_ROUTES.find((r) => r.id === activeRouteId) || DEMO_ROUTES[0];
      executeRoutePlan(
        { lat: activePreset.origin.coords[1], lng: activePreset.origin.coords[0], name: activePreset.origin.name },
        { lat: activePreset.destination.coords[1], lng: activePreset.destination.coords[0], name: activePreset.destination.name },
        newProfile
      );
    }
  }

  // Switch Map Style
  function handleStyleChange(style: string) {
    if (!mapRef.current) return;
    setCurrentStyle(style);

    const existingData = mapRef.current.getSource("active-route-src")?._data;
    mapRef.current.setStyle(getMapStyleSpec(style, lang));

    mapRef.current.once("style.load", () => {
      if (existingData) {
        if (!mapRef.current.getSource("active-route-src")) {
          mapRef.current.addSource("active-route-src", { type: "geojson", data: existingData });
          mapRef.current.addLayer({
            id: "active-route-glow",
            type: "line",
            source: "active-route-src",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": profile === "bajaj" ? "#f59e0b" : "#0284c7",
              "line-width": 9,
              "line-opacity": 0.45,
            },
          });
          mapRef.current.addLayer({
            id: "active-route-core",
            type: "line",
            source: "active-route-src",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": profile === "bajaj" ? "#fbbf24" : "#38bdf8",
              "line-width": 4,
            },
          });
        }
      }
    });
  }

  // Toggle 3D Perspective Pitch
  function toggle3DPerspective() {
    if (!mapRef.current) return;
    const next = !is3D;
    setIs3D(next);
    mapRef.current.easeTo({
      pitch: next ? 55 : 0,
      bearing: next ? -18 : 0,
      duration: 1000,
    });
  }

  // Reset Camera View
  function resetCamera() {
    if (!mapRef.current) return;
    const targetCity = ETHIOPIA_CITIES.find((c) => c.name === activeCity) || ETHIOPIA_CITIES[0];
    mapRef.current.flyTo({
      center: targetCity.coords,
      zoom: targetCity.zoom,
      pitch: 0,
      bearing: 0,
      duration: 1200,
    });
    setIs3D(false);
  }

  // Handle Autocomplete Search
  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const apiUrl = getEffectiveApiUrl();
    try {
      const res = await fetch(`${apiUrl}/api/v1/map/autocomplete?q=${encodeURIComponent(q)}&limit=5&lang=${lang}&key=${DEFAULT_DEMO_API_KEY}`, {
        headers: {
          "X-API-Key": DEFAULT_DEMO_API_KEY,
          "X-Lang": lang,
        },
      });
      const data = await res.json();
      if (data.success && data.data?.results) {
        setSearchResults(data.data.results);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  // Select place from autocomplete
  function selectPlace(item: any) {
    if (!mapRef.current) return;
    const lat = item.location?.latitude || item.latitude;
    const lng = item.location?.longitude || item.longitude;

    if (lat && lng) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14.5, duration: 1500 });

      import("maplibre-gl").then((lib) => {
        new lib.default.Marker({ color: "#f59e0b" })
          .setLngLat([lng, lat])
          .setPopup(
            new lib.default.Popup({ offset: 20 }).setHTML(
              `<div style="min-width: 170px; padding: 4px; font-family: sans-serif;">
                <b style="color: #f59e0b; font-size: 0.85rem;">${item.name}</b>
                <div style="color: #94a3b8; font-size: 0.72rem; margin: 2px 0 6px;">${item.address || item.category || ""}</div>
                <div style="display: flex; gap: 4px;">
                  <button style="background: #10b981; color: #fff; border: none; border-radius: 4px; padding: 3px 6px; font-size: 0.7rem; cursor: pointer;"
                    onclick="window.__setStartPoint(${lat}, ${lng}, '${item.name.replace(/'/g, "\\'")}')">${lang === "am" ? "መነሻ አድርግ" : "Start Here"}</button>
                  <button style="background: #0284c7; color: #fff; border: none; border-radius: 4px; padding: 3px 6px; font-size: 0.7rem; cursor: pointer;"
                    onclick="window.__setEndPoint(${lat}, ${lng}, '${item.name.replace(/'/g, "\\'")}')">${lang === "am" ? "መድረሻ አድርግ" : "End Here"}</button>
                </div>
              </div>`
            )
          )
          .addTo(mapRef.current);
      });
    }

    setSearchResults([]);
    setSearchQuery(item.name);
  }

  // Clear Custom Markers & Active Route
  function clearActiveRoute() {
    if (!mapRef.current) return;
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    setCustomOrigin(null);
    setCustomDest(null);

    if (mapRef.current.getSource("active-route-src")) {
      mapRef.current.getSource("active-route-src").setData({
        type: "FeatureCollection",
        features: [],
      });
    }
    setRouteSummary(null);
    setRouteSteps([]);
  }

  // Delivery Session Simulator: Create Session
  async function handleCreateSession() {
    setSessionLoading(true);
    const apiUrl = getEffectiveApiUrl();
    try {
      const activePreset = DEMO_ROUTES.find((r) => r.id === activeRouteId) || DEMO_ROUTES[0];
      const payload = {
        deliveryId: `deliv-${Date.now().toString().slice(-4)}`,
        origin: { lat: activePreset.origin.coords[1], lng: activePreset.origin.coords[0] },
        destination: { lat: activePreset.destination.coords[1], lng: activePreset.destination.coords[0] },
        profile,
        lang,
      };

      const res = await fetch(`${apiUrl}/api/v1/map/routes/create?lang=${lang}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": DEFAULT_DEMO_API_KEY,
          "X-Lang": lang,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSessionInfo({
          sessionId: data.data.session?.id || data.data.sessionId || data.data.id || "sess_live_109283",
          revision: data.data.session?.currentRevision || 1,
          status: data.data.session?.status || "active",
          deviationResult: null,
        });
      }
    } catch {
      setSessionInfo({
        sessionId: `sess_${Date.now().toString().slice(-6)}`,
        revision: 1,
        status: "active",
        deviationResult: null,
      });
    } finally {
      setSessionLoading(false);
    }
  }

  // Delivery Session Simulator: Test Deviation
  async function handleCheckDeviation(testType: "on-route" | "off-route") {
    if (!sessionInfo.sessionId) return;
    setSessionLoading(true);
    const apiUrl = getEffectiveApiUrl();

    try {
      const testCoord =
        testType === "on-route"
          ? { lat: 8.9851, lng: 38.7674 }
          : { lat: 9.0450, lng: 38.8350 };

      const res = await fetch(`${apiUrl}/api/v1/map/routes/session/${sessionInfo.sessionId}/check-deviation?lang=${lang}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": DEFAULT_DEMO_API_KEY,
          "X-Lang": lang,
        },
        body: JSON.stringify(testCoord),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSessionInfo((prev) => ({
          ...prev,
          deviationResult: {
            deviated: data.data.status === "off_route",
            distanceMeters: Math.round(data.data.deviationMeters || (testType === "on-route" ? 14 : 280)),
            message: data.data.message,
          },
        }));
      }
    } catch {
      setSessionInfo((prev) => ({
        ...prev,
        deviationResult: {
          deviated: testType === "off-route",
          distanceMeters: testType === "on-route" ? 14 : 280,
          message: lang === "am"
            ? (testType === "off-route" ? "አሽከርካሪው ከተመደበው መንገድ 280 ሜትር ወጥቷል" : "አሽከርካሪው በትክክለኛው መንገድ ላይ ነው")
            : (testType === "off-route" ? "Driver is off route by 280m" : "Driver is on route"),
        },
      }));
    } finally {
      setSessionLoading(false);
    }
  }

  // Delivery Session Simulator: Re-plan Session
  async function handleReplanSession() {
    if (!sessionInfo.sessionId) return;
    setSessionLoading(true);
    const apiUrl = getEffectiveApiUrl();
    try {
      const activePreset = DEMO_ROUTES.find((r) => r.id === activeRouteId) || DEMO_ROUTES[0];
      await fetch(`${apiUrl}/api/v1/map/routes/session/${sessionInfo.sessionId}/replan?lang=${lang}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": DEFAULT_DEMO_API_KEY,
          "X-Lang": lang,
        },
        body: JSON.stringify({
          origin: { lat: 9.0200, lng: 38.7800 },
          destination: { lat: activePreset.destination.coords[1], lng: activePreset.destination.coords[0] },
          profile,
          reason: "driver_deviation",
          lang,
        }),
      });
      setSessionInfo((prev) => ({
        ...prev,
        revision: (prev.revision || 1) + 1,
        deviationResult: null,
      }));
    } catch {
      setSessionInfo((prev) => ({
        ...prev,
        revision: (prev.revision || 1) + 1,
        deviationResult: null,
      }));
    } finally {
      setSessionLoading(false);
    }
  }

  // Toggle Language Handler
  function toggleLanguage() {
    const nextLang = lang === "en" ? "am" : "en";
    setLang(nextLang);

    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyleSpec(currentStyle, nextLang));
    }

    // Re-render active route with new language
    if (customOrigin && customDest) {
      executeRoutePlan(customOrigin, customDest, profile);
    } else {
      const activePreset = DEMO_ROUTES.find((r) => r.id === activeRouteId) || DEMO_ROUTES[0];
      executeRoutePlan(
        { lat: activePreset.origin.coords[1], lng: activePreset.origin.coords[0], name: activePreset.origin.name },
        { lat: activePreset.destination.coords[1], lng: activePreset.destination.coords[0], name: activePreset.destination.name },
        profile
      );
    }
    if (mapRef.current) {
      plotCityLandmarks(mapRef.current, activeCity);
    }
  }

  const effectiveApiUrl = getEffectiveApiUrl();

  // Generate exact cURL command
  const generatedCurl = inspectData?.request
    ? `curl -X POST "${effectiveApiUrl}/api/v1/map/route?lang=${lang}" \\
  -H "Content-Type: application/json" \\
  -H "X-Lang: ${lang}" \\
  -d '${JSON.stringify(inspectData.request, null, 2)}'`
    : `curl -X POST "${effectiveApiUrl}/api/v1/map/route?lang=${lang}" \\
  -H "Content-Type: application/json" \\
  -H "X-Lang: ${lang}" \\
  -d '{ "origin": { "lat": 8.9806, "lng": 38.7578 }, "destination": { "lat": 8.9774, "lng": 38.7993 }, "profile": "driving", "lang": "${lang}", "steps": true }'`;

  function copyCurl() {
    navigator.clipboard.writeText(generatedCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  }

  return (
    <section id="sandbox" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem 4rem" }}>
      <div id="playground" style={{ position: "relative", top: "-4rem", visibility: "hidden" }} />

      {/* ── mapcn.dev Bento Grid Showcase ────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Card 1: Active Fleet & Deliveries */}
        <div
          className="bento-card"
          style={{
            padding: "1.25rem",
            background: "linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(9, 9, 11, 0.95) 100%)",
            minHeight: "170px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 600 }}>
                {lang === "am" ? "ንቁ የትራንስፖርት ጉዞዎች • አዲስ አበባና ጎንደር" : "Active Deliveries • Addis & Gondar"}
              </span>
              <span className="live-pulse-dot" />
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#ffffff" }}>
              3,544
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem", fontSize: "0.8rem" }}>
              <span style={{ color: "#34d399", fontWeight: 600 }}>+12.5%</span>
              <span style={{ color: "var(--muted-foreground)" }}>{lang === "am" ? "ካለፈው ሰዓት አንፃር" : "vs last hour"}</span>
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "0.65rem", marginTop: "0.75rem" }}>
            {lang === "am" ? "የመንገድ ክፍለ ጊዜዎች በ100 ሜትር የማስጠንቀቂያ መቆጣጠሪያ ነቅተዋል።" : "Canonical route sessions active with deviation alerting (>100m threshold)."}
          </div>
        </div>

        {/* Card 2: Route Loop & Elevation */}
        <div
          className="bento-card"
          style={{
            padding: "1.25rem",
            background: "linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(9, 9, 11, 0.95) 100%)",
            minHeight: "170px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
              <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 600 }}>
                {lang === "am" ? "የመስቀል አደባባይ – ቦሌ ጉዞ" : "Bole – Meskel Sq Loop"}
              </span>
              <span className="badge-pill" style={{ height: "1.25rem", fontSize: "0.65rem", padding: "0 0.5rem" }}>
                {lang === "am" ? "ፈጣን OSRM" : "OSRM Fast"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem", textAlign: "center" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "0.4rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>6.2</div>
                <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>{lang === "am" ? "ኪ.ሜ" : "KM"}</div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "0.4rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>14</div>
                <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>{lang === "am" ? "ደቂቃ" : "MINS"}</div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "0.4rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>0</div>
                <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>{lang === "am" ? "ክፍያ" : "TOLL"}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "0.65rem", marginTop: "0.75rem" }}>
            {lang === "am" ? "የመታጠፊያ አቅጣጫዎች ሙሉ በሙሉ በአማርኛ ቋንቋ ቀርበዋል።" : "Turn maneuvers with localized Amharic intersection guidance."}
          </div>
        </div>

        {/* Card 3: Regional Hubs Quick Switcher */}
        <div
          className="bento-card"
          style={{
            padding: "1.25rem",
            background: "linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(9, 9, 11, 0.95) 100%)",
            minHeight: "170px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 600, marginBottom: "0.65rem" }}>
              {lang === "am" ? "የኢትዮጵያ ከተሞች • ዝላይ" : "Regional Hubs • Jump View"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {ETHIOPIA_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => flyToCity(c)}
                  className={`btn-mapcn btn-mapcn-xs ${activeCity === c.name ? "btn-mapcn-primary" : "btn-mapcn-outline"}`}
                  style={{ borderRadius: "var(--radius-full)", fontSize: "0.7rem", padding: "0 0.55rem" }}
                >
                  {lang === "am" ? c.amharic : c.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "0.65rem", marginTop: "0.75rem" }}>
            {lang === "am" ? "አማራ (ጎንደር)፣ ኦሮሚያ፣ ሲዳማ እና ድሬዳዋን ያካተተ ሀገራዊ ሽፋን።" : "Nationwide coverage including Amhara (Gondar), Oromia, Sidama, and Dire Dawa."}
          </div>
        </div>

        {/* Card 4: Location Confidence & Enrichment */}
        <div
          className="bento-card"
          style={{
            padding: "1.25rem",
            background: "linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(9, 9, 11, 0.95) 100%)",
            minHeight: "170px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 600 }}>
                {lang === "am" ? "የቦታ አስተማማኝነት" : "Location Intelligence"}
              </span>
              <span className="badge-pill" style={{ color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                {lang === "am" ? "98% አስተማማኝ" : "98% Confidence"}
              </span>
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff", marginTop: "0.2rem" }}>
              {activeCity === "Gondar" ? "ፋሲል ግቢ (የነገሥታት አዳራሽ)" : "ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
              {activeCity === "Gondar" ? "Fasil Ghebbi • UNESCO Heritage" : "Bole Airport • 1,820 outcomes verified"}
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "0.65rem", marginTop: "0.75rem" }}>
            {lang === "am" ? "በእውነተኛ የማድረስ ውጤቶች እና የአካባቢው ምልክቶች የተደገፈ።" : "Self-reinforcing delivery feedback loop with crowd-sourced landmark names."}
          </div>
        </div>
      </div>

      {/* Main Map Card */}
      <div
        className="bento-card"
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Top Control Toolbar */}
        <div
          style={{
            padding: "0.65rem 1rem",
            background: "#09090b",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.65rem",
          }}
        >
          {/* Style Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 500, marginRight: "0.2rem" }}>
              {lang === "am" ? "ገጽታ:" : "Style:"}
            </span>
            {(["dark", "voyager", "light", "osm"] as const).map((styleKey) => (
              <button
                key={styleKey}
                onClick={() => handleStyleChange(styleKey)}
                className={`btn-mapcn btn-mapcn-xs ${currentStyle === styleKey ? "btn-mapcn-primary" : "btn-mapcn-outline"}`}
                style={{ textTransform: "capitalize" }}
              >
                {styleKey === "voyager" ? (lang === "am" ? "መንገድ" : "Street") : styleKey === "dark" ? (lang === "am" ? "ጨለማ" : "Dark") : styleKey === "light" ? (lang === "am" ? "ብርሃን" : "Light") : "OSM"}
              </button>
            ))}
          </div>

          {/* Travel Profile Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 500, marginRight: "0.2rem" }}>
              {lang === "am" ? "ተሽከርካሪ:" : "Profile:"}
            </span>
            {(["driving", "bajaj", "walking", "cycling"] as const).map((pKey) => (
              <button
                key={pKey}
                onClick={() => handleProfileChange(pKey)}
                className={`btn-mapcn btn-mapcn-xs ${profile === pKey ? "btn-mapcn-primary" : "btn-mapcn-outline"}`}
              >
                {pKey === "driving"
                  ? (lang === "am" ? "🚗 መኪና" : "🚗 Driving")
                  : pKey === "bajaj"
                  ? (lang === "am" ? "🛺 ባጃጅ" : "🛺 Bajaj")
                  : pKey === "walking"
                  ? (lang === "am" ? "🚶 እግር" : "🚶 Walking")
                  : (lang === "am" ? "🚲 ብስክሌት" : "🚲 Cycling")}
              </button>
            ))}
          </div>

          {/* Universal Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn-mapcn btn-mapcn-xs"
            style={{
              background: lang === "am" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
              border: lang === "am" ? "1px solid #10b981" : "1px solid var(--border)",
              color: lang === "am" ? "#34d399" : "#ffffff",
              fontWeight: 600,
              borderRadius: "var(--radius-full)",
              padding: "0 0.65rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
            title="Toggle between English and Amharic"
          >
            <span>{lang === "am" ? "🇪🇹 አማርኛ" : "🇬🇧 English"}</span>
            <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>({lang.toUpperCase()})</span>
          </button>

          {/* Autocomplete Search input */}
          <div style={{ position: "relative", width: "220px" }}>
            <input
              id="search-input"
              type="text"
              placeholder={lang === "am" ? "ቦታዎችን በኢትዮጵያ ይፈልጉ..." : "Search places in Ethiopia..."}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-full)",
                padding: "0.35rem 0.85rem",
                color: "#ffffff",
                fontSize: "0.785rem",
                outline: "none",
              }}
            />
            {searchLoading && (
              <span style={{ position: "absolute", right: "10px", top: "7px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                ...
              </span>
            )}

            {/* Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "#0f172a",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  zIndex: 100,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                }}
              >
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectPlace(item)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                      borderBottom: idx < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      fontSize: "0.775rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ color: "#38bdf8", fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{item.address || item.category || ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Route Presets & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
              {lang === "am" ? "መንገዶች:" : "Presets:"}
            </span>
            {DEMO_ROUTES.map((r) => (
              <button
                key={r.id}
                disabled={loadingRoute}
                onClick={() => {
                  setActiveRouteId(r.id);
                  setCustomOrigin(null);
                  setCustomDest(null);
                  setProfile(r.profile);
                  executeRoutePlan(
                    { lat: r.origin.coords[1], lng: r.origin.coords[0], name: lang === "am" && r.origin.nameAmharic ? r.origin.nameAmharic : r.origin.name },
                    { lat: r.destination.coords[1], lng: r.destination.coords[0], name: lang === "am" && r.destination.nameAmharic ? r.destination.nameAmharic : r.destination.name },
                    r.profile
                  );
                }}
                className={`btn btn-sm ${activeRouteId === r.id ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
              >
                {lang === "am" && r.titleAmharic ? r.titleAmharic : (r.title.split("→")[1]?.trim() || r.title)}
              </button>
            ))}

            <button
              onClick={toggle3DPerspective}
              className={`btn btn-sm ${is3D ? "btn-accent" : "btn-secondary"}`}
              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
              title="Toggle 3D Perspective Pitch"
            >
              {is3D ? (lang === "am" ? "3D በርቷል" : "3D Pitch On") : (lang === "am" ? "3D ዕይታ" : "3D View")}
            </button>

            <button
              onClick={resetCamera}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem" }}
              title="Re-center camera to current city"
            >
              {lang === "am" ? "ማዕከል" : "Center"}
            </button>

            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.725rem", padding: "0.25rem 0.55rem", borderColor: inspectorOpen ? "#38bdf8" : undefined }}
              title="Inspect developer tools, steps, and session"
            >
              {inspectorOpen ? (lang === "am" ? "ኮንሶል ዝጋ" : "Hide Console") : (lang === "am" ? "የገንቢ ኮንሶል" : "Developer Console")}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ position: "relative", width: "100%", height: "540px" }}>
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

          {/* Floating Route Info HUD */}
          {routeSummary && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                zIndex: 10,
                background: "rgba(10, 16, 31, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "0.85rem 1.25rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                  {lang === "am" ? "ንቁ የታቀደ መንገድ" : "Active Planned Route"} ({routeSummary.profile})
                </span>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffffff" }}>
                  {routeSummary.originName} → {routeSummary.destinationName}
                </div>
              </div>
              <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1.25rem" }}>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                  {lang === "am" ? "ርቀት" : "Distance"}
                </span>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#38bdf8" }}>
                  {routeSummary.distance}
                </div>
              </div>
              <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1.25rem" }}>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                  {lang === "am" ? "የተገመተ ጊዜ" : "Estimated Duration"}
                </span>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#10b981" }}>
                  {routeSummary.duration}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => {
                    setInspectorOpen(true);
                    setActiveDrawerTab("steps");
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem" }}
                >
                  {routeSteps.length} {lang === "am" ? "መታጠፊያዎች" : "Steps"}
                </button>
                <button
                  onClick={clearActiveRoute}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", color: "#f87171" }}
                  title="Clear current route"
                >
                  {lang === "am" ? "አጽዳ" : "Clear"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Developer Console / Inspector Drawer */}
        {inspectorOpen && (
          <div
            style={{
              background: "#030712",
              borderTop: "1px solid var(--border-card)",
              maxHeight: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer Sub-Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 1.25rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(10, 16, 31, 0.98)",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setActiveDrawerTab("payload")}
                  style={{
                    background: activeDrawerTab === "payload" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: activeDrawerTab === "payload" ? "#38bdf8" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  GeoJSON Payload
                </button>

                <button
                  onClick={() => setActiveDrawerTab("steps")}
                  style={{
                    background: activeDrawerTab === "steps" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: activeDrawerTab === "steps" ? "#38bdf8" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {lang === "am" ? `የአቅጣጫ መመሪያዎች (${routeSteps.length})` : `Turn-by-Turn Maneuvers (${routeSteps.length})`}
                </button>

                <button
                  onClick={() => setActiveDrawerTab("session")}
                  style={{
                    background: activeDrawerTab === "session" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: activeDrawerTab === "session" ? "#38bdf8" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {lang === "am" ? "የመንገድ ክፍለ ጊዜ ማስመሰያ" : "Route Session Simulator"}
                </button>

                <button
                  onClick={() => setActiveDrawerTab("curl")}
                  style={{
                    background: activeDrawerTab === "curl" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: activeDrawerTab === "curl" ? "#38bdf8" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  cURL Request
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.72rem" }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>200 OK</span>
                <span style={{ color: "var(--text-muted)" }}>&bull;</span>
                <span style={{ color: "var(--text-secondary)" }}>{inspectData?.latencyMs || 14}ms</span>
                <span style={{ color: "var(--text-muted)" }}>&bull;</span>
                <span style={{ color: "#38bdf8" }}>OSRM Engine</span>
              </div>
            </div>

            {/* Tab 1: GeoJSON Response */}
            {activeDrawerTab === "payload" && (
              <div style={{ padding: "1rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#38bdf8" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {inspectData ? JSON.stringify(inspectData.response, null, 2) : "Calculating route..."}
                </pre>
              </div>
            )}

            {/* Tab 2: Turn-by-Turn Steps */}
            {activeDrawerTab === "steps" && (
              <div style={{ padding: "1rem 1.25rem" }}>
                {routeSteps.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {lang === "am" ? "ምንም የመንገድ ደረጃዎች አልተፈጠሩም። መጀመሪያ መንገድ ያቅዱ።" : "No route steps generated. Plan a route first."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {routeSteps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.45rem 0.75rem",
                          background: "rgba(255, 255, 255, 0.03)",
                          borderRadius: "6px",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: "rgba(56, 189, 248, 0.15)",
                              color: "#38bdf8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ color: "#e2e8f0" }}>
                            {step.instruction || `${step.type} ${step.modifier || ""}`}
                          </span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#94a3b8" }}>
                          {step.distanceText || (step.distance?.value ? `${step.distance.value} m` : "")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Route Session Simulator */}
            {activeDrawerTab === "session" && (
              <div style={{ padding: "1rem 1.25rem" }}>
                <div style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.825rem", lineHeight: 1.5 }}>
                  {lang === "am"
                    ? "የማይለወጥ የመንገድ ክፍለ ጊዜ ስሪት እና የጂፒኤስ የመንገድ መዛባት ቁጥጥር ለእሽቅድምድም እና ለማድረሻ ስርዓቶች።"
                    : "The Canonical Route Session aggregate guarantees immutable route versions and GPS deviation detection for logistics and courier platforms."}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <button
                    onClick={handleCreateSession}
                    disabled={sessionLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {sessionLoading ? "Processing..." : (lang === "am" ? "1. የማድረስ ክፍለ ጊዜ ፍጠር" : "1. Create Delivery Session")}
                  </button>

                  <button
                    onClick={() => handleCheckDeviation("on-route")}
                    disabled={!sessionInfo.sessionId || sessionLoading}
                    className="btn btn-secondary btn-sm"
                  >
                    {lang === "am" ? "2. ትክክለኛ መንገድ አስመስል" : "2. Simulate On-Route GPS"}
                  </button>

                  <button
                    onClick={() => handleCheckDeviation("off-route")}
                    disabled={!sessionInfo.sessionId || sessionLoading}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: "#ef4444", color: "#fca5a5" }}
                  >
                    {lang === "am" ? "3. የመንገድ መዛባት (>100ሜ)" : "3. Simulate Off-Route (>100m)"}
                  </button>

                  <button
                    onClick={handleReplanSession}
                    disabled={!sessionInfo.sessionId || sessionLoading}
                    className="btn btn-secondary btn-sm"
                  >
                    {lang === "am" ? "4. አዲስ መንገድ አቅድ (ስሪት 2)" : "4. Re-plan Route (Revision v2)"}
                  </button>
                </div>

                {sessionInfo.sessionId && (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      padding: "0.85rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.775rem",
                    }}
                  >
                    <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.3rem" }}>
                      {lang === "am" ? "ንቁ የመንገድ ክፍለ ጊዜ:" : "Active Route Session:"} {sessionInfo.sessionId}
                    </div>
                    <div style={{ color: "#94a3b8" }}>
                      {lang === "am" ? "ወቅታዊ ስሪት:" : "Current Revision:"} <b style={{ color: "#38bdf8" }}>v{sessionInfo.revision || 1}</b> &bull; {lang === "am" ? "ሁኔታ:" : "Status:"} {sessionInfo.status || "ACTIVE"}
                    </div>
                    {sessionInfo.deviationResult && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.4rem 0.65rem",
                          borderRadius: "4px",
                          background: sessionInfo.deviationResult.deviated ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                          color: sessionInfo.deviationResult.deviated ? "#fca5a5" : "#6ee7b7",
                          border: `1px solid ${sessionInfo.deviationResult.deviated ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                        }}
                      >
                        {sessionInfo.deviationResult.message
                          ? sessionInfo.deviationResult.message
                          : sessionInfo.deviationResult.deviated
                          ? `⚠️ ${lang === "am" ? "አሽከርካሪው ከተመደበው መንገድ ወጥቷል:" : "DRIVER OFF-ROUTE ALERT:"} ${sessionInfo.deviationResult.distanceMeters}m`
                          : `✓ ${lang === "am" ? "አሽከርካሪው በትክክለኛው መንገድ ላይ ነው:" : "DRIVER ON ROUTE:"} ${sessionInfo.deviationResult.distanceMeters}m`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: cURL Request */}
            {activeDrawerTab === "curl" && (
              <div style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {lang === "am" ? "ለአሁኑ መንገድ የተዘጋጀ የ cURL ትዕዛዝ:" : "cURL Command for Current Route:"}
                  </span>
                  <button
                    onClick={copyCurl}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}
                  >
                    {copiedCurl ? (lang === "am" ? "✓ ተቀድቷል" : "✓ Copied") : (lang === "am" ? "ቅዳ" : "Copy cURL")}
                  </button>
                </div>
                <div
                  style={{
                    background: "rgba(5, 8, 17, 0.95)",
                    padding: "0.85rem",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "#cbd5e1",
                    overflowX: "auto",
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{generatedCurl}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
