import React from "react";
import { API_BASE_URL } from "@/lib/api-config";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/map/route",
    title: "Turn-by-Turn Route Planning",
    desc: "Computes optimal driving, cycling, or walking route geometry (GeoJSON LineString) between coordinates, with distance, duration, and step maneuvers.",
    example: `POST ${API_BASE_URL}/api/v1/map/route
{ "origin": { "lat": 8.9806, "lng": 38.7578 }, "destination": { "lat": 8.9832295, "lng": 38.795694 }, "profile": "bajaj", "lang": "am" }`,
  },
  {
    method: "POST",
    path: "/api/v1/map/matrix",
    title: "Distance Matrix (NxM Table)",
    desc: "Computes a sub-15ms road distance and duration matrix between multiple driver coordinates and customer pickup spots.",
    example: `POST ${API_BASE_URL}/api/v1/map/matrix
{ "origins": [{ "latitude": 9.012, "longitude": 38.760 }], "destinations": [{ "latitude": 9.010, "longitude": 38.761 }], "profile": "car" }`,
  },
  {
    method: "POST",
    path: "/api/v1/map/dispatch/nearby",
    title: "Production Dispatch Engine",
    desc: "Two-stage spatial dispatch filter evaluating nearby couriers and ranking them by true Ethiopian road ETA (<5ms).",
    example: `POST ${API_BASE_URL}/api/v1/map/dispatch/nearby
{ "pickup": { "latitude": 9.0108, "longitude": 38.7615 }, "vehicleType": "bajaj", "radiusKm": 5.0, "limit": 10 }`,
  },
  {
    method: "GET",
    path: "/api/v1/map/styles/:style.json",
    title: "MapLibre Style Specification (v8)",
    desc: "Returns a complete MapLibre v8 Style JSON. Use directly as the style URL in MapLibre GL JS, Flutter, React Native, or Native iOS/Android SDKs.",
    example: `GET ${API_BASE_URL}/api/v1/map/styles/dark.json
// styles: dark, voyager, light, osm`,
  },
  {
    method: "GET",
    path: "/api/v1/map/autocomplete",
    title: "Multi-Source Place Search",
    desc: "Ranks results across saved places, PackMan landmark database, recommendation engine, and Photon geocoder with Amharic/English aliases.",
    example: `GET ${API_BASE_URL}/api/v1/map/autocomplete?q=Bole+Medhanialem&limit=5`,
  },
  {
    method: "GET",
    path: "/api/v1/map/reverse-geocode",
    title: "Reverse Geocoding",
    desc: "Converts GPS coordinates into formatted human-readable street names, landmarks, and sub-cities in Addis Ababa and Ethiopia.",
    example: `GET ${API_BASE_URL}/api/v1/map/reverse-geocode?lat=9.0105&lng=38.7612`,
  },
  {
    method: "POST",
    path: "/api/v1/map/routes/create",
    title: "Canonical Route Session",
    desc: "Creates an immutable, audit-grade route session for a delivery. Tracks delivery status, deviation thresholds (>100m), and versioned replanning.",
    example: `POST ${API_BASE_URL}/api/v1/map/routes/create
{ "deliveryId": "deliv-882", "origin": { "lat": 8.98, "lng": 38.75 }, "destination": { "lat": 9.02, "lng": 38.77 } }`,
  },
  {
    method: "GET",
    path: "/api/v1/map/tiles/:style/:z/:x/:y.png",
    title: "Direct Map Tiles Proxy",
    desc: "Serves standard 256x256 raster map tiles with HTTP immutable caching headers for high-speed offline/online rendering.",
    example: `GET ${API_BASE_URL}/api/v1/map/tiles/dark/13/4978/3956.png`,
  },
  {
    method: "POST",
    path: "/api/v1/map/location-enrichment",
    title: "Location Intelligence & Gate Notes",
    desc: "Enriches coordinates with local building names, security gate entrances, compound access rules, and Amharic phonetic aliases.",
    example: `POST ${API_BASE_URL}/api/v1/map/location-enrichment
{ "latitude": 8.9806, "longitude": 38.7578, "suggestedName": "Addis Stadium Gate 2", "extraDetails": { "gate": "North" } }`,
  },
  {
    method: "POST",
    path: "/api/v1/map/routes/session/:id/check-deviation",
    title: "GPS Deviation Guard",
    desc: "Compares real-time driver GPS coordinates against the canonical planned geometry. Flags off-route alerts when deviation exceeds 100 meters.",
    example: `POST ${API_BASE_URL}/api/v1/map/routes/session/sess-441/check-deviation
{ "lat": 8.9851, "lng": 38.7674 }`,
  },
  {
    method: "GET",
    path: "/api/v1/map/nearby",
    title: "Nearby Category Search",
    desc: "Queries POIs, landmarks, hospitals, fuel stations, and cafes within a given meter radius of a lat/lng coordinate.",
    example: `GET ${API_BASE_URL}/api/v1/map/nearby?lat=9.0105&lng=38.7612&radius=1500&category=fuel`,
  },
];

export function ApiEndpoints() {
  return (
    <section id="reference" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "#ffffff" }}>
            API Reference
          </h2>
          <p style={{ color: "var(--muted-foreground)", maxWidth: "520px", marginTop: "0.4rem", fontSize: "0.95rem" }}>
            Standard REST endpoints, JSON responses, and CORS-enabled for web and mobile frontends.
          </p>
        </div>
        <a
          href="/docs"
          className="btn-mapcn btn-mapcn-outline"
          style={{ fontSize: "0.85rem" }}
        >
          View Full Interactive Docs &rarr;
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem" }}>
        {ENDPOINTS.map((ep, i) => (
          <div
            key={i}
            className="bento-card"
            style={{
              padding: "1.25rem",
              background: "linear-gradient(180deg, rgba(17, 24, 39, 0.5) 0%, rgba(9, 9, 11, 0.8) 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                    background: ep.method === "GET" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
                    color: ep.method === "GET" ? "#34d399" : "#38bdf8",
                    border: `1px solid ${ep.method === "GET" ? "rgba(16, 185, 129, 0.25)" : "rgba(56, 189, 248, 0.25)"}`,
                  }}
                >
                  {ep.method}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.825rem", color: "#ffffff", fontWeight: 500 }}>
                  {ep.path}
                </span>
              </div>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.35rem", color: "#ffffff" }}>
                {ep.title}
              </h3>

              <p style={{ color: "var(--muted-foreground)", fontSize: "0.825rem", lineHeight: 1.5, marginBottom: "0.85rem" }}>
                {ep.desc}
              </p>
            </div>

            <div
              style={{
                background: "#09090b",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.65rem 0.75rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "#94a3b8",
                overflowX: "auto",
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{ep.example}</pre>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
