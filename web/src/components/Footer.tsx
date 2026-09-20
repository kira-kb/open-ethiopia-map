"use client";

import React from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "rgba(9, 9, 11, 0.95)",
        marginTop: "5rem",
        padding: "3.5rem 1.5rem 2.5rem",
      }}
    >
      <div className="container-mapcn">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Col 1: Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Open Ethiopia Map</span>
            </Link>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: "0.85rem",
                marginTop: "0.75rem",
                lineHeight: 1.55,
                maxWidth: "280px",
              }}
            >
              Free & open-source, ready-to-use map components and canonical routing APIs for Ethiopia.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.85rem" }}>
              Product
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
              <li>
                <Link href="/docs" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs#components" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  Components
                </Link>
              </li>
              <li>
                <Link href="/#sandbox" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  Interactive Sandbox
                </Link>
              </li>
              <li>
                <Link href="/docs#api-reference" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.85rem" }}>
              Community
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  OpenStreetMap Ethiopia
                </a>
              </li>
              <li>
                <a href={`${API_BASE_URL}/health`} target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  System Health
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.85rem" }}>
              Resources
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
              <li>
                <a href="https://maplibre.org" target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  MapLibre GL
                </a>
              </li>
              <li>
                <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  shadcn/ui
                </a>
              </li>
              <li>
                <a href="http://project-osrm.org" target="_blank" rel="noreferrer" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
                  OSRM Engine
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border & copyright */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            fontSize: "0.775rem",
            color: "var(--muted-foreground)",
          }}
        >
          <div>&copy; {new Date().getFullYear()} Open Ethiopia Map. Released under the MIT License.</div>
          <div>100% Free &bull; Zero API Keys &bull; No Watermarks</div>
        </div>
      </div>
    </footer>
  );
}
