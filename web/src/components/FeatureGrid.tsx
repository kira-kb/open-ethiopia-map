"use client";

import React from "react";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Zero Config",
    desc: "Works out of the box with free, unmetered map tiles. No credit card, no account, and zero API keys needed.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" opacity="0.2" />
      </svg>
    ),
    title: "Theme Aware",
    desc: "Seamlessly switches between Dark, Light, Street, and OSM map styles with standard MapLibre v8 specifications.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />
      </svg>
    ),
    title: "Composable",
    desc: "Build complex logistics, delivery tracking, and map UIs with simple, modular components for React, Next.js, and mobile.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "TypeScript",
    desc: "Full type safety with comprehensive TypeScript route definitions, GeoJSON schemas, and delivery session interfaces.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    ),
    title: "Copy & Paste",
    desc: "Own your code. Drop components directly into your project without heavy SDK dependencies or proprietary lock-in.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: "Any Map Style",
    desc: "Use any MapLibre v8-compatible tiles, or priority self-host your own rendered Ethiopian tiles directly from disk.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "#ffffff" }}>
          Why Open Ethiopia Map?
        </h2>
        <p style={{ color: "var(--muted-foreground)", maxWidth: "560px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
          Built for engineers who want fast, reliable geospatial intelligence without surprise billing or proprietary SDKs.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {FEATURES.map((item, idx) => (
          <div
            key={idx}
            className="bento-card"
            style={{
              padding: "1.35rem",
              background: "linear-gradient(180deg, rgba(17, 24, 39, 0.5) 0%, rgba(9, 9, 11, 0.8) 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border)",
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff" }}>
                {item.title}
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
