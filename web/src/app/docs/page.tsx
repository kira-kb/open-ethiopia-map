"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api-config";

function LiveMapPreview({ styleUrl }: { styleUrl: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: styleUrl,
          center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
          zoom: 12.2,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        map.on("error", (e: any) => setError(String(e?.error?.message || e?.error || "Map error")));
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  return (
    <div style={{ margin: "1rem 0 1.25rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.45rem" }}>
        🗺️ Live MapLibre Preview
      </div>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "340px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)", background: "#0b1120" }}
      />
      {error && <p style={{ fontSize: "0.72rem", color: "#fca5a5", marginTop: "0.35rem" }}>Map load error: {error}</p>}
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.78rem", marginTop: "0.45rem", lineHeight: 1.5 }}>
        This map is rendered with MapLibre GL JS using the style, vector tiles, and label fonts served by this API. Pan and zoom
        to inspect the tiles; the copy-paste examples below produce the same result.
      </p>
    </div>
  );
}

export default function DocsPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  function copyCode(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  function CodeBlock({ code, id, note }: { code: string; id: string; note?: string }) {
    return (
      <>
        {note && (
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
            {note}
          </p>
        )}
        <div style={{ position: "relative" }}>
          <pre className="code-block-shadcn">{code}</pre>
          <button
            onClick={() => copyCode(code, id)}
            className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            {copiedSnippet === id ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </>
    );
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
                Tile Endpoints
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>
                  <a href="#tile-endpoints" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Vector / Raster / Glyphs
                  </a>
                </li>
                <li>
                  <a href="#component-map" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Basic Map (React)
                  </a>
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.65rem" }}>
                SDK Examples
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>
                  <a href="#sdk-web" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    MapLibre GL JS (Web)
                  </a>
                </li>
                <li>
                  <a href="#sdk-react-native" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    React Native (MapLibre)
                  </a>
                </li>
                <li>
                  <a href="#sdk-react-native-maps" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    react-native-maps
                  </a>
                </li>
                <li>
                  <a href="#sdk-flutter" className="btn-mapcn btn-mapcn-ghost" style={{ justifyContent: "flex-start", width: "100%", height: "1.85rem", fontSize: "0.825rem" }}>
                    Flutter
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

              <h3 id="tile-endpoints" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                Tile Endpoints (delivered by this server)
              </h3>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                When the local PMTiles archive is present, styles use <strong>vector tiles</strong>. The raster endpoint remains
                available as a fallback and for clients such as <code>react-native-maps</code> that only accept PNG tiles.
              </p>
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>URL template</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Vector tiles (primary)</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/tiles/vector/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.mvt</code></td>
                    <td>Raw Mapbox Vector Tiles from <code>ethiopia.pmtiles</code>. Response header: <code>X-Tile-Source: self-hosted-pmtiles</code>.</td>
                  </tr>
                  <tr>
                    <td><strong>Raster tiles (fallback)</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/tiles/&#123;style&#125;/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</code></td>
                    <td>Styles: dark, light, voyager, street, osm, standard, satellite, topo. Proxied and disk-cached by us from ArcGIS/OSM/OpenTopoMap (header <code>X-Tile-Source: write-through-cache</code>); use vector tiles for fully local imagery.</td>
                  </tr>
                  <tr>
                    <td><strong>Label fonts (glyphs)</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/fonts/&#123;fontstack&#125;/&#123;range&#125;.pbf</code></td>
                    <td>Self-hosted Noto Sans (Latin + Amharic). Header: <code>X-Glyph-Source: self-hosted</code>.</td>
                  </tr>
                  <tr>
                    <td><strong>Style JSON</strong></td>
                    <td><code>{API_BASE_URL}/api/v1/map/styles/&#123;style&#125;.json?lang=am&amp;showMainRoads=true</code></td>
                    <td>MapLibre Style Spec v8. Pass <code>lang=en</code> or <code>lang=am</code> for label language. Roads are uniform by default; add <code>showMainRoads=true</code> to color major roads.</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ position: "relative", marginTop: "0.75rem" }}>
                <pre className="code-block-shadcn">{`${API_BASE_URL}/api/v1/map/tiles/vector/{z}/{x}/{y}.mvt
${API_BASE_URL}/api/v1/map/fonts/Noto%20Sans%20Regular/0-255.pbf`}</pre>
                <button
                  onClick={() => copyCode(`${API_BASE_URL}/api/v1/map/tiles/vector/{z}/{x}/{y}.mvt`, "tile-url")}
                  className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                  {copiedSnippet === "tile-url" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.6, marginTop: "0.75rem" }}>
                <strong style={{ color: "#ffffff" }}>Road colors:</strong> by default every road uses a single neutral color,
                matching the calm look of <a href="https://mapcn.dev" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>mapcn.dev</a>.
                Add <code>showMainRoads=true</code> (or <code>mainRoads=true</code>) to the style URL to restore color-coded
                motorways, trunks, primary and secondary roads.
              </p>
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
      attributionControl: false,
    });

    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "420px", borderRadius: "10px" }} />;
}`}</pre>
                <button
                  onClick={() =>
                    copyCode(
                      `"use client";\nimport React, { useEffect, useRef } from "react";\nimport maplibregl from "maplibre-gl";\nimport "maplibre-gl/dist/maplibre-gl.css";\n\nexport function BasicMap() {\n  const containerRef = useRef<HTMLDivElement>(null);\n  const mapRef = useRef<maplibregl.Map | null>(null);\n\n  useEffect(() => {\n    if (mapRef.current || !containerRef.current) return;\n    mapRef.current = new maplibregl.Map({\n      container: containerRef.current,\n      style: "${API_BASE_URL}/api/v1/map/styles/dark.json",\n      center: [38.7612, 9.0105],\n      zoom: 12.5,\n      attributionControl: false,\n    });\n    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");\n    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");\n    return () => mapRef.current?.remove();\n  }, []);\n\n  return <div ref={containerRef} style={{ width: "100%", height: "420px", borderRadius: "10px" }} />;\n}`,
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

            {/* SDK: MapLibre GL JS */}
            <section id="sdk-web" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                SDK: MapLibre GL JS (Browser)
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                The following standalone HTML file is a complete, copy-paste map. It loads the style JSON, vector tiles,
                and label fonts from this server — no third-party tile or font host is contacted.
              </p>
              <LiveMapPreview styleUrl={`${API_BASE_URL}/api/v1/map/styles/dark.json?lang=en`} />
              <CodeBlock
                id="sdk-html"
                code={`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Open Ethiopia Map</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>html, body, #map { margin: 0; width: 100%; height: 100%; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = new maplibregl.Map({
      container: "map",
      style: "${API_BASE_URL}/api/v1/map/styles/dark.json?lang=en",
      center: [38.7612, 9.0105],   // Addis Ababa [lng, lat]
      zoom: 12.5,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("error", (e) => console.error("Map error:", e.error));
  </script>
</body>
</html>`}
              />
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", marginTop: "1rem", marginBottom: "0.5rem" }}>
                React / Next.js equivalent (install with <code>npm install maplibre-gl</code>):
              </p>
              <CodeBlock
                id="sdk-react"
                code={`"use client";
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function EthiopiaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "${API_BASE_URL}/api/v1/map/styles/dark.json?lang=en",
      center: [38.7612, 9.0105],
      zoom: 12.5,
      attributionControl: false,
    });
    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current.on("error", (e) => console.error("Map error:", e.error));
    return () => mapRef.current?.remove();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "420px" }} />;
}`}
              />
            </section>

            {/* SDK: React Native MapLibre */}
            <section id="sdk-react-native" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                SDK: React Native (@maplibre/maplibre-react-native)
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                Install with <code>npm install @maplibre/maplibre-react-native</code>. Version 11 requires the React Native new
                architecture; Expo needs a development build (not Expo Go), and bare React Native needs <code>pod install</code>.
                The style URL below points at this server, so vector tiles and Amharic glyphs are fetched from us.
              </p>
              <CodeBlock
                id="sdk-rn-libre"
                code={`import React from "react";
import { StyleSheet } from "react-native";
import { Camera, Map } from "@maplibre/maplibre-react-native";

const STYLE_URL = "${API_BASE_URL}/api/v1/map/styles/dark.json?lang=am";

export default function EthiopiaMap() {
  return (
    <Map style={styles.map} mapStyle={STYLE_URL} attributionEnabled={true}>
      <Camera initialViewState={{ center: [38.7612, 9.0105], zoom: 12.5 }} />
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});`}
                note="v11 API shown above. On v10 use MapView with mapStyle and Camera defaultSettings; setAccessToken(null) no longer exists."
              />
            </section>

            {/* SDK: react-native-maps (raster) */}
            <section id="sdk-react-native-maps" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                SDK: react-native-maps (Raster TileLayer)
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                <code>react-native-maps</code> uses Apple/Google map engines and cannot load a MapLibre vector style directly.
                Overlay our raster tiles with <code>TileLayer</code> and set <code>mapType="none"</code> to hide the provider basemap.
              </p>
              <CodeBlock
                id="sdk-rn-maps"
                code={`import React from "react";
import MapView, { TileLayer } from "react-native-maps";

export default function EthiopiaRasterMap() {
  return (
    <MapView
      style={{ flex: 1 }}
      mapType="none"
      initialRegion={{
        latitude: 9.0105,
        longitude: 38.7612,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <TileLayer
        url="${API_BASE_URL}/api/v1/map/tiles/dark/{z}/{x}/{y}.png"
        tileSize={256}
      />
    </MapView>
  );
}`}
                note="For vector tiles, markers, and Amharic labels prefer @maplibre/maplibre-react-native above."
              />
            </section>

            {/* SDK: Flutter */}
            <section id="sdk-flutter" className="docs-section">
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                SDK: Flutter (maplibre_gl)
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                Install with <code>flutter pub add maplibre_gl</code>. Supplying the style URL is enough — the plugin fetches
                tiles and glyphs from this server.
              </p>
              <CodeBlock
                id="sdk-flutter"
                code={`import "package:flutter/material.dart";
import "package:maplibre_gl/maplibre_gl.dart";

class EthiopiaMap extends StatelessWidget {
  const EthiopiaMap({super.key});

  @override
  Widget build(BuildContext context) {
    return MapLibreMap(
      styleString: "${API_BASE_URL}/api/v1/map/styles/dark.json?lang=am",
      initialCameraPosition: const CameraPosition(
        target: LatLng(9.0105, 38.7612),
        zoom: 12.5,
      ),
      onMapCreated: (controller) {},
    );
  }
}`}
              />
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
  "destination": { "lat": 8.9832295, "lng": 38.795694 },
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
              <a href="#tile-endpoints" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Tile Endpoints</a>
              <a href="#self-hosted" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Self-Hosted Tiles</a>
              <a href="#component-map" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Basic Map (React)</a>
              <a href="#sdk-web" style={{ color: "#38bdf8", textDecoration: "none" }}>MapLibre GL JS</a>
              <a href="#sdk-react-native" style={{ color: "#38bdf8", textDecoration: "none" }}>React Native (MapLibre)</a>
              <a href="#sdk-react-native-maps" style={{ color: "#38bdf8", textDecoration: "none" }}>react-native-maps</a>
              <a href="#sdk-flutter" style={{ color: "#38bdf8", textDecoration: "none" }}>Flutter</a>
              <a href="#api-route" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Plan Route</a>
              <a href="#api-autocomplete" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Autocomplete</a>
              <a href="#api-sessions" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Route Sessions</a>
              <a href="#api-matrix" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Distance Matrix</a>
              <a href="#api-dispatch" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Dispatch Engine</a>
              <a href="#api-match" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>Snap to Roads</a>
            </nav>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
