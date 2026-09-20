"use client";

import React from "react";

const FEATURES = [
  {
    icon: "🗺️",
    badge: "SDK Agnostic",
    title: "Native MapLibre GL Integration",
    desc: "Single-endpoint MapLibre Style Specification v8. Render hardware-accelerated dark, light, street, or OSM styles natively in Flutter, React Native, iOS, Android, and Web.",
  },
  {
    icon: "⚡",
    badge: "<15ms Latency",
    title: "Tuned OSRM Routing Engine",
    desc: "Optimized specifically for Addis Ababa road topologies, Ring Roads, and inner arteries. Computes turn-by-turn maneuvers, bearing, and step instructions in milliseconds.",
  },
  {
    icon: "🎯",
    badge: "Fleet Logistics",
    title: "Canonical Route Sessions",
    desc: "Provides immutable route revisions with cryptographic hashing. Features replanning guards, GPS deviation detection (>100m threshold), and complete audit trails.",
  },
  {
    icon: "🏢",
    badge: "Ethiopian Context",
    title: "Landmark & Alias Intelligence",
    desc: "Built for addresses where street numbers don't exist. Supports dual Amharic/English search, building landmarks, gate entrance points, and security notes.",
  },
  {
    icon: "🔄",
    badge: "High Resilience",
    title: "Dual Provider Failover",
    desc: "Includes automated circuit breakers with GraphHopper fallback. If upstream network hiccups occur, traffic immediately shifts with zero client disruptions.",
  },
  {
    icon: "💸",
    badge: "Zero Lock-In",
    title: "100% Free & Open-Source",
    desc: "No Google Maps bills ($5–$7 per 1,000 loads) or surprise quota caps. Built with TypeScript, PostgreSQL, and Redis under the permissive MIT license.",
  },
];

export function FeatureGrid() {
  return (
    <section id="capabilities" style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="badge badge-green" style={{ marginBottom: "0.75rem" }}>
          Architecture & Capabilities
        </span>
        <h2 style={{ fontSize: "2.3rem", fontWeight: 800 }}>
          Engineered for High-Throughput Ethiopian Logistics
        </h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "620px", margin: "0.5rem auto 0", fontSize: "1rem" }}>
          Built from the ground up for courier fleets, e-commerce deliveries, ride-hailing networks, and spatial services.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {FEATURES.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: "1.85rem",
              borderRadius: "var(--radius-xl)",
              transition: "transform 0.25s ease, border-color 0.25s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border-card)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "1.75rem",
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {item.icon}
              </div>
              <span className="badge badge-cyan">{item.badge}</span>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.6rem" }}>
              {item.title}
            </h3>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
