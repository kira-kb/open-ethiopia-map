"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api-config";

export default function DocsPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  function copyCode(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <Navbar />

      <div className="container-mapcn" style={{ flex: 1 }}>
        <div className="docs-wrapper">
          {/* ── Left Sidebar Navigation ─────────────────────────────── */}
          <aside className="docs-sidebar hidden-mobile">
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.65rem" }}>
                Basics
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>
                  <a href="#intro" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Introduction
                  </a>
                </li>
                <li>
                  <a href="#installation" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Installation
                  </a>
                </li>
                <li>
                  <a href="#styles-tiles" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Free Styles & Tiles
                  </a>
                </li>
                <li>
                  <a href="#self-hosted" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Self-Hosted Tiles
                  </a>
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.65rem" }}>
                Components
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>
                  <a href="#component-map" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Map Container
                  </a>
                </li>
                <li>
                  <a href="#component-markers" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Markers & Popups
                  </a>
                </li>
                <li>
                  <a href="#component-routes" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Route Geometry
                  </a>
                </li>
                <li>
                  <a href="#component-deviation" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Deviation Monitor
                  </a>
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.65rem" }}>
                API Reference
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>
                  <a href="#api-route" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Plan Route
                  </a>
                </li>
                <li>
                  <a href="#api-autocomplete" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Autocomplete Search
                  </a>
                </li>
                <li>
                  <a href="#api-reverse" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Reverse Geocode
                  </a>
                </li>
                <li>
                  <a href="#api-nearby" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Nearby Places
                  </a>
                </li>
                <li>
                  <a href="#api-sessions" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Route Sessions
                  </a>
                </li>
                <li>
                  <a href="#api-matrix" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem", color: "#38bdf8" }}>
                    Distance Matrix
                  </a>
                </li>
                <li>
                  <a href="#api-dispatch" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem", color: "#10b981" }}>
                    Dispatch Engine
                  </a>
                </li>
                <li>
                  <a href="#api-match" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Snap to Roads
                  </a>
                </li>
                <li>
                  <a href="#api-enrichment" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Location Enrichment
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* ── Main Docs Content ──────────────────────────────────── */}
          <main className="docs-content">
            {/* Header / Intro */}
            <section id="intro" className="docs-section">
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="badge-pill" style={{ borderColor: "rgba(16, 185, 129, 0.3)", color: "#34d399" }}>
                  v1.0.0
                </span>
                <span className="badge-pill">MapLibre GL Spec v8</span>
                <span className="badge-pill">100% Free • No API Key</span>
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: "0.75rem" }}>
                Open Ethiopia Map Documentation
              </h1>
              <p style={{ fontSize: "1.05rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Open Ethiopia Map provides high-performance, developer-first geospatial services, turn-by-turn routing,
                and vector/raster map tiles tailored specifically for Ethiopia.
              </p>
            </section>

            {/* Installation */}
            <section id="installation" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Installation
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Install MapLibre GL in your React, Next.js, or vanilla JavaScript application:
              </p>
              <div style={{ position: "relative" }}>
                <pre className="code-block-shadcn">npm install maplibre-gl</pre>
                <button
                  onClick={() => copyCode("npm install maplibre-gl", "install-npm")}
                  className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                  {copiedSnippet === "install-npm" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", marginTop: "0.75rem" }}>
                For Flutter apps, run <code>flutter pub add maplibre_gl</code>. For React Native, install <code>@maplibre/maplibre-react-native</code>.
              </p>
            </section>

            {/* Free Styles & Tiles */}
            <section id="styles-tiles" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Free Map Styles & Tiles
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                The service hosts four official MapLibre Style Specification (v8) stylesheets. All styles are 100% free,
                unmetered, zero API keys, and guaranteed free of watermarks:
              </p>

              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Style</th>
                    <th>Style Spec URL</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Dark</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/styles/dark.json</code></td>
                    <td>Clean dark cartography optimized for night-mode UI and delivery dispatching.</td>
                  </tr>
                  <tr>
                    <td><strong>Light</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/styles/light.json</code></td>
                    <td>Minimalist light canvas, ideal for dashboard overlays and dense analytics.</td>
                  </tr>
                  <tr>
                    <td><strong>Street (Voyager)</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/styles/voyager.json</code></td>
                    <td>High-contrast road network highlighting primary and secondary arteries.</td>
                  </tr>
                  <tr>
                    <td><strong>OSM Standard</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/styles/osm.json</code></td>
                    <td>Official community OpenStreetMap standard tile cartography.</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                Direct Slippy Tile URL Pattern
              </h3>
              <div style={{ position: "relative" }}>
                <pre className="code-block-shadcn">{API_BASE_URL}/api/v1/map/tiles/:style/:z/:x/:y.png</pre>
                <button
                  onClick={() => copyCode(`${API_BASE_URL}/api/v1/map/tiles/dark/{z}/{x}/{y}.png`, "tile-url")}
                  className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                  {copiedSnippet === "tile-url" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </section>

            {/* Self-Hosted Tiles */}
            <section id="self-hosted" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Self-Hosted Local Custom Tiles
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Open Ethiopia Map natively supports self-rendered local disk tiles!
                If your deployment renders its own custom vector or raster tiles, simply place tile files in:
              </p>
              <pre className="code-block-shadcn">data/tiles/&#123;style&#125;/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</pre>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                The server automatically prioritizes local tiles and serves them with header <code>X-Tile-Source: self-hosted-local</code>.
                If a tile is not found on disk, it seamlessly streams from the open unmetered mirror.
              </p>
            </section>

            {/* Component: Map Container */}
            <section id="component-map" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Component: Basic Map
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                A clean, copy-paste React component built on MapLibre GL:
              </p>
              <div style={{ position: "relative" }}>
                <pre className="code-block-shadcn">{`"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function BasicMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "${API_BASE_URL}/api/v1/map/styles/dark.json",
      center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
      zoom: 12.5,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "420px", borderRadius: "10px" }} />;
}`}</pre>
                <button
                  onClick={() =>
                    copyCode(
                      `"use client";\nimport React, { useEffect, useRef } from "react";\nimport maplibregl from "maplibre-gl";\nimport "maplibre-gl/dist/maplibre-gl.css";\n\nexport function BasicMap() {\n  const containerRef = useRef<HTMLDivElement>(null);\n  const mapRef = useRef<maplibregl.Map | null>(null);\n\n  useEffect(() => {\n    if (mapRef.current || !containerRef.current) return;\n    mapRef.current = new maplibregl.Map({\n      container: containerRef.current,\n      style: "${API_BASE_URL}/api/v1/map/styles/dark.json",\n      center: [38.7612, 9.0105],\n      zoom: 12.5,\n    });\n    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");\n    return () => mapRef.current?.remove();\n  }, []);\n\n  return <div ref={containerRef} style={{ width: "100%", height: "420px", borderRadius: "10px" }} />;\n}`,
                      "comp-map"
                    )
                  }
                  className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                  {copiedSnippet === "comp-map" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </section>

            {/* API: Plan Route */}
            <section id="api-route" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Plan Route
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge-pill" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 700 }}>
                  POST
                </span>
                <code>/api/v1/map/route</code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Computes optimal driving, walking, or cycling paths across Ethiopian road topologies. Returns GeoJSON line geometry,
                distance in meters, duration in seconds, and turn-by-turn step maneuvers.
              </p>

              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", marginTop: "1rem" }}>Request Payload</h4>
              <pre className="code-block-shadcn">{`{
  "origin": { "lat": 8.9806, "lng": 38.7578 },
  "destination": { "lat": 8.9774, "lng": 38.7993 },
  "profile": "driving",
  "steps": true
}`}</pre>

              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", marginTop: "1rem" }}>Response (200 OK)</h4>
              <pre className="code-block-shadcn">{`{
  "distanceMeters": 6240,
  "durationSeconds": 850,
  "geometry": {
    "type": "LineString",
    "coordinates": [[38.7578, 8.9806], [38.7612, 8.9801], ...]
  },
  "instructions": [
    { "text": "Depart east toward Africa Avenue", "distance": 180, "duration": 25 },
    { "text": "Continue onto Bole Road", "distance": 4200, "duration": 520 },
    { "text": "Arrive at destination", "distance": 0, "duration": 0 }
  ],
  "provider": "osrm",
  "cacheHit": true
}`}</pre>
            </section>

            {/* API: Autocomplete Search */}
            <section id="api-autocomplete" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Autocomplete Search
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: 700 }}>
                  GET
                </span>
                <code>/api/v1/map/autocomplete?q=&#123;query&#125;&limit=5</code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Multi-source location search querying local Ethiopian landmark records, saved user places, and geocoder fallbacks.
                Fully supports Amharic script queries (e.g. <code>መስቀል አደባባይ</code>).
              </p>

              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>q</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Search term (English or Amharic, e.g. "Bole Medhanialem" or "ቦሌ")</td>
                  </tr>
                  <tr>
                    <td><code>limit</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Max results to return (default: 5, max: 20)</td>
                  </tr>
                  <tr>
                    <td><code>lat, lng</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Focus coordinates for geographic proximity ranking</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* API: Route Sessions */}
            <section id="api-sessions" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Canonical Route Sessions
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Designed for courier logistics and live delivery tracking. Sessions maintain immutable route revisions,
                detect driver GPS deviations, and log audit history.
              </p>

              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge-pill" style={{ color: "#38bdf8" }}>POST</span></td>
                    <td><code>/api/v1/map/routes/create</code></td>
                    <td>Create canonical route session bound to deliveryId</td>
                  </tr>
                  <tr>
                    <td><span className="badge-pill" style={{ color: "#34d399" }}>GET</span></td>
                    <td><code>/api/v1/map/routes/session/:id</code></td>
                    <td>Retrieve active planned geometry and instructions</td>
                  </tr>
                  <tr>
                    <td><span className="badge-pill" style={{ color: "#38bdf8" }}>POST</span></td>
                    <td><code>/api/v1/map/routes/session/:id/check-deviation</code></td>
                    <td>Verify if driver GPS has deviated &gt;100m from route</td>
                  </tr>
                  <tr>
                    <td><span className="badge-pill" style={{ color: "#38bdf8" }}>POST</span></td>
                    <td><code>/api/v1/map/routes/session/:id/replan</code></td>
                    <td>Create immutable revision v2 with new driver origin</td>
                  </tr>
                  <tr>
                    <td><span className="badge-pill" style={{ color: "#38bdf8" }}>POST</span></td>
                    <td><code>/api/v1/map/routes/session/:id/close</code></td>
                    <td>Complete or cancel delivery route session</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* API: Distance Matrix */}
            <section id="api-matrix" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Distance Matrix ($N \times M$ Durations & Distances)
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge-pill" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 700 }}>
                  POST
                </span>
                <code>/api/v1/map/matrix</code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Computes driving durations and road distances between multiple courier coordinates and customer pickup spots in a single high-speed call (&lt;15ms).
              </p>
              <pre className="code-block-shadcn">{`POST ${API_BASE_URL}/api/v1/map/matrix
{
  "origins": [
    { "latitude": 9.0120, "longitude": 38.7600 },
    { "latitude": 9.0150, "longitude": 38.7700 }
  ],
  "destinations": [
    { "latitude": 9.0108, "longitude": 38.7615 }
  ],
  "profile": "bajaj"
}`}</pre>
            </section>

            {/* API: Production Dispatch Nearby */}
            <section id="api-dispatch" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Production Dispatch Engine (Road ETA Ranking)
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: 700 }}>
                  POST
                </span>
                <code>/api/v1/map/dispatch/nearby</code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Dispatches nearby couriers and drivers by true Ethiopian road network duration (accounting for barrier detours, road surface, and slope) rather than naive Euclidean distance.
              </p>
              <pre className="code-block-shadcn">{`POST ${API_BASE_URL}/api/v1/map/dispatch/nearby
{
  "pickup": { "latitude": 9.0108, "longitude": 38.7615 },
  "vehicleType": "bajaj",
  "deliveryId": "del_109283",
  "radiusKm": 5.0,
  "limit": 10
}`}</pre>
            </section>

            {/* API: Snap-to-Roads */}
            <section id="api-match" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                API: Snap-to-Roads / GPS Map Matching
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge-pill" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 700 }}>
                  POST
                </span>
                <code>/api/v1/map/match</code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Aligns noisy GPS breadcrumbs recorded from driver mobile apps directly onto OpenStreetMap street centerlines with interpolated rotation bearings.
              </p>
              <pre className="code-block-shadcn">{`POST ${API_BASE_URL}/api/v1/map/match
{
  "coordinates": [
    { "latitude": 9.0108, "longitude": 38.7615, "timestamp": 1711200000 },
    { "latitude": 9.0112, "longitude": 38.7620, "timestamp": 1711200005 }
  ],
  "profile": "car"
}`}</pre>
            </section>
          </main>

          {/* ── Right Table of Contents ─────────────────────────────── */}
          <aside className="docs-toc hidden-mobile">
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
              On This Page
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.8rem" }}>
              <a href="#intro" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Introduction</a>
              <a href="#installation" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Installation</a>
              <a href="#styles-tiles" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Free Styles & Tiles</a>
              <a href="#self-hosted" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Self-Hosted Tiles</a>
              <a href="#component-map" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Map Container</a>
              <a href="#api-route" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Plan Route</a>
              <a href="#api-autocomplete" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Autocomplete</a>
              <a href="#api-sessions" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Route Sessions</a>
              <a href="#api-matrix" style={{ color: "#38bdf8", textDecoration: "none" }}>Distance Matrix</a>
              <a href="#api-dispatch" style={{ color: "#10b981", textDecoration: "none" }}>Dispatch Engine</a>
              <a href="#api-match" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Snap to Roads</a>
            </nav>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
