"use client";

import React, { useState } from "react";
import { API_BASE_URL, PLATFORM_METRICS } from "@/lib/api-config";

export function Hero() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const curlCmd = `curl -s "${API_BASE_URL}/api/v1/map/styles/dark.json"`;

  function copyCommand() {
    navigator.clipboard.writeText(curlCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  }

  return (
    <section
      style={{
        position: "relative",
        padding: "4.5rem 1.5rem 3rem",
        textAlign: "center",
        maxWidth: "1150px",
        margin: "0 auto",
      }}
    >
      <div>
        {/* Clean Developer Tag (No pulsing dots) */}
        <div style={{ marginBottom: "1.25rem" }}>
          <span
            className="badge badge-cyan"
            style={{
              padding: "0.3rem 0.85rem",
              fontSize: "0.8rem",
              borderRadius: "var(--radius-xs)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
            }}
          >
            <span>v1.0.0 &bull; Open-Source Geospatial Infrastructure &bull; Addis Ababa</span>
          </span>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4rem)",
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            fontWeight: 800,
          }}
        >
          The Open Routing & <br />
          <span className="gradient-accent">Geospatial Authority</span> for Ethiopia
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
            color: "var(--text-secondary)",
            maxWidth: "760px",
            margin: "0 auto 2rem",
            lineHeight: 1.65,
          }}
        >
          High-performance OSRM routing, MapLibre GL style specifications, and multi-source place geocoding 
          built specifically for Ethiopian road topologies. Zero proprietary lock-in, zero API billing surprises.
        </p>

        {/* Interactive Developer Quickstart Terminal */}
        <div
          style={{
            maxWidth: "620px",
            margin: "0 auto 2.5rem",
            background: "var(--bg-terminal)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            textAlign: "left",
          }}
        >
          <div className="terminal-header">
            <div className="window-dots">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.725rem", color: "var(--text-muted)" }}>
              bash &bull; quickstart style endpoint
            </span>
            <button
              onClick={copyCommand}
              style={{
                background: "transparent",
                border: "none",
                color: copiedCmd ? "#34d399" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.725rem",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              {copiedCmd ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div
            style={{
              padding: "0.85rem 1.15rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.825rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              overflowX: "auto",
            }}
          >
            <span style={{ color: "#10b981", userSelect: "none" }}>$</span>
            <span style={{ color: "#e2e8f0" }}>{curlCmd}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem",
            flexWrap: "wrap",
            marginBottom: "3.5rem",
          }}
        >
          <a href="#playground" className="btn btn-primary" id="hero-cta-playground">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Open API Playground</span>
          </a>

          <a href="#reference" className="btn btn-secondary" id="hero-cta-reference">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>API Reference</span>
          </a>

          <a href="#sdks" className="btn btn-secondary" id="hero-cta-sdks">
            <span>SDK Guides</span>
          </a>
        </div>

        {/* Technical Architecture Specs Bar */}
        <div
          className="glass-panel"
          style={{
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 1.75rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1.25rem",
            border: "1px solid var(--border-card)",
          }}
        >
          {PLATFORM_METRICS.map((metric, i) => (
            <div
              key={i}
              style={{
                textAlign: "left",
                borderRight: i < PLATFORM_METRICS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                paddingRight: "1rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                {metric.value}
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "2px" }}>
                {metric.label}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
