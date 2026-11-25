"use client";

import React, { useState } from "react";
import { API_BASE_URL } from "@/lib/api-config";

const CODE_SNIPPETS = {
  react: {
    title: "Next.js & React (MapLibre GL JS)",
    install: "npm install maplibre-gl",
    code: `// components/EthiopiaMap.tsx
"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function EthiopiaMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "${API_BASE_URL}/api/v1/map/styles/dark.json",
      center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
      zoom: 12.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add Meskel Square marker
    new maplibregl.Marker({ color: "#10b981" })
      .setLngLat([38.7578, 8.9806])
      .setPopup(new maplibregl.Popup().setText("Meskel Square, Addis Ababa"))
      .addTo(map.current);

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "480px", borderRadius: "12px" }} />;
}`,
  },
  flutter: {
    title: "Flutter Mobile SDK",
    install: "flutter pub add maplibre_gl",
    code: `// lib/screens/map_screen.dart
import 'package:flutter/material.dart';
import 'package:maplibre_gl/maplibre_gl.dart';

class EthiopiaMapScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Open Ethiopia Map')),
      body: MapLibreMap(
        styleString: '${API_BASE_URL}/api/v1/map/styles/dark.json',
        initialCameraPosition: const CameraPosition(
          target: LatLng(9.0105, 38.7612),
          zoom: 12.5,
        ),
        onMapCreated: (MapLibreMapController controller) {
          // Plot marker at Meskel Square
          controller.addCircle(const CircleOptions(
            geometry: LatLng(8.9806, 38.7578),
            circleColor: "#10b981",
            circleRadius: 8.0,
          ));
        },
      ),
    );
  }
}`,
  },
  native: {
    title: "React Native Mobile",
    install: "npm install @maplibre/maplibre-react-native",
    code: `// screens/MobileMap.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

MapLibreGL.setAccessToken(null); // No token needed!

export function MobileMap() {
  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="${API_BASE_URL}/api/v1/map/styles/dark.json"
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          zoomLevel={12.5}
          centerCoordinate={[38.7612, 9.0105]} // [lng, lat]
          animationMode="flyTo"
        />
        <MapLibreGL.PointAnnotation id="meskel" coordinate={[38.7578, 8.9806]}>
          <View style={styles.marker} />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  marker: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#10b981", borderWidth: 2, borderColor: "#fff" },
});`,
  },
  curl: {
    title: "cURL & REST API",
    install: "Terminal / HTTP Client",
    code: `# 1. Compute Turn-by-Turn Route
curl -X POST "${API_BASE_URL}/api/v1/map/route" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": { "lat": 8.9806, "lng": 38.7578 },
    "destination": { "lat": 8.9832295, "lng": 38.795694 },
    "profile": "driving",
    "steps": true
  }'

# 2. Autocomplete Search
curl "${API_BASE_URL}/api/v1/map/autocomplete?q=Bole&limit=5"

# 3. Reverse Geocode Coordinates
curl "${API_BASE_URL}/api/v1/map/reverse-geocode?lat=9.0105&lng=38.7612"

# 4. Fetch MapLibre Style Specification (v8)
curl "${API_BASE_URL}/api/v1/map/styles/dark.json"`,
  },
};

export function CodeWorkbench() {
  const [activeTab, setActiveTab] = useState<keyof typeof CODE_SNIPPETS>("react");
  const [copied, setCopied] = useState(false);

  const snippet = CODE_SNIPPETS[activeTab];

  function copyCode() {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <section id="sdks" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "#ffffff" }}>
          Multi-Platform SDK Integration
        </h2>
        <p style={{ color: "var(--muted-foreground)", maxWidth: "580px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
          Render vector & raster tiles and execute routing queries across Web, Flutter, React Native, iOS, Android, and backend services.
        </p>
      </div>

      <div
        className="bento-card"
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Terminal / IDE Header */}
        <div
          style={{
            padding: "0.65rem 1rem",
            background: "#09090b",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {(Object.keys(CODE_SNIPPETS) as Array<keyof typeof CODE_SNIPPETS>).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`btn-mapcn btn-mapcn-xs ${activeTab === tabKey ? "btn-mapcn-primary" : "btn-mapcn-ghost"}`}
                style={{ fontSize: "0.75rem" }}
              >
                {tabKey === "react" ? "React / Next.js" : tabKey === "flutter" ? "Flutter" : tabKey === "native" ? "React Native" : "cURL"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
              {snippet.install}
            </span>
            <button
              onClick={copyCode}
              className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
              style={{ fontSize: "0.725rem", padding: "0 0.65rem" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "#0d1117",
            overflowX: "auto",
            maxHeight: "440px",
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "0.825rem",
              lineHeight: 1.6,
              color: "#e2e8f0",
            }}
          >
            {snippet.code}
          </pre>
        </div>
      </div>
    </section>
  );
}
