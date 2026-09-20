import React from "react";
import { API_BASE_URL } from "@/lib/api-config";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(3, 6, 14, 0.95)",
        padding: "3.5rem 1.5rem 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "2.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ maxWidth: "360px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🇪🇹</span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color: "#ffffff" }}>
              Open Ethiopia Map
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            The open-source geospatial routing authority and MapLibre tile infrastructure designed for Ethiopian developers, delivery platforms, and logistics networks.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <span className="badge badge-green" style={{ fontSize: "0.725rem" }}>
              MIT Licensed &bull; Community Driven
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "3.5rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#ffffff", marginBottom: "0.75rem" }}>
              Platform
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.825rem" }}>
              <li><a href="#playground" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>MapLibre Playground</a></li>
              <li><a href="#capabilities" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Capabilities</a></li>
              <li><a href="#sdks" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>SDK Quickstarts</a></li>
              <li><a href="#reference" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>API Reference</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#ffffff", marginBottom: "0.75rem" }}>
              Developers
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.825rem" }}>
              <li><a href={`${API_BASE_URL}`} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Backend Swagger & Docs</a></li>
              <li><a href={`${API_BASE_URL}/health`} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Live Health Check</a></li>
              <li><a href={`${API_BASE_URL}/api/v1/map/styles/dark.json`} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Dark Style JSON</a></li>
              <li><a href="https://github.com/kira-kb/open-ethiopia-map" target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>GitHub Repository</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.775rem",
          color: "var(--text-muted)",
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} Open Ethiopia Map Contributors. Released under the MIT License.
        </div>
        <div>
          Made with 💚 for the Ethiopian Tech Ecosystem
        </div>
      </div>
    </footer>
  );
}
