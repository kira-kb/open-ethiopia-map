import React from "react";
import { API_BASE_URL } from "@/lib/api-config";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/map/route",
    title: "Turn-by-Turn Route Planning",
    desc: "Computes optimal driving, cycling, or walking route geometry (GeoJSON LineString) between coordinates, with distance, duration, and step maneuvers.",
    example: `POST ${API_BASE_URL}/api/v1/map/route
{ "origin": { "lat": 8.9806, "lng": 38.7578 }, "destination": { "lat": 8.9774, "lng": 38.7993 }, "profile": "driving" }`,
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
    <section id="reference" style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="badge badge-green" style={{ marginBottom: "0.75rem" }}>
          RESTful Endpoints
        </span>
        <h2 style={{ fontSize: "2.3rem", fontWeight: 800 }}>
          API Reference & Endpoints
        </h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
          Clean JSON payloads, standard HTTP response codes, and CORS-enabled for web and mobile frontends.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        {ENDPOINTS.map((ep, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-card)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: ep.method === "GET" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
                    color: ep.method === "GET" ? "#34d399" : "#38bdf8",
                    border: `1px solid ${ep.method === "GET" ? "rgba(16, 185, 129, 0.3)" : "rgba(56, 189, 248, 0.3)"}`,
                  }}
                >
                  {ep.method}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
                  {ep.path}
                </span>
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                {ep.title}
              </h3>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                {ep.desc}
              </p>
            </div>

            <div
              style={{
                background: "rgba(5, 8, 17, 0.9)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.65rem 0.85rem",
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
