import React from "react";

export function Architecture() {
  return (
    <section id="architecture" style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="badge badge-cyan" style={{ marginBottom: "0.75rem" }}>
          Clean Architecture
        </span>
        <h2 style={{ fontSize: "2.3rem", fontWeight: 800 }}>
          Layered Microservice Design
        </h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
          Strict Domain-Driven Design (DDD) with provider agnosticism, circuit breakers, and zero vendor lock-in.
        </p>
      </div>

      <div
        className="glass-panel"
        style={{
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem 2rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {/* Layer 1: Clients */}
          <div
            style={{
              background: "rgba(5, 8, 17, 0.8)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.5rem" }}>
              Layer 1 &bull; Consumers
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Client Apps & SDKs</h3>
            <ul style={{ listStyle: "none", color: "var(--text-secondary)", fontSize: "0.825rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>📱 Driver Mobile App (Flutter)</li>
              <li>🛒 Customer Tracking (React Native)</li>
              <li>💻 Web Portals (Next.js / MapLibre)</li>
              <li>⚡ Backend Microservices (REST / PubSub)</li>
            </ul>
          </div>

          {/* Layer 2: Presentation & App */}
          <div
            style={{
              background: "rgba(5, 8, 17, 0.8)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", marginBottom: "0.5rem" }}>
              Layer 2 &bull; Application
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Use Cases & Sessions</h3>
            <ul style={{ listStyle: "none", color: "var(--text-secondary)", fontSize: "0.825rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>🎯 CreateRouteSessionUseCase</li>
              <li>🛣️ PlanRouteUseCase (MD5 cache)</li>
              <li>🔍 SearchPlacesUseCase (4 sources)</li>
              <li>📍 ReverseGeocodeUseCase</li>
              <li>⚠️ CheckDeviationUseCase (&gt;100m)</li>
            </ul>
          </div>

          {/* Layer 3: Domain */}
          <div
            style={{
              background: "rgba(5, 8, 17, 0.8)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem" }}>
              Layer 3 &bull; Core Domain
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Entities & Intelligence</h3>
            <ul style={{ listStyle: "none", color: "var(--text-secondary)", fontSize: "0.825rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>📦 RouteSession & Revision chain</li>
              <li>🏢 Location & Multi-lingual Aliases</li>
              <li>📊 RecommendationEngine</li>
              <li>⚡ RankingPipeline (Deduplication)</li>
              <li>📈 LocationConfidence scoring</li>
            </ul>
          </div>

          {/* Layer 4: Infrastructure */}
          <div
            style={{
              background: "rgba(5, 8, 17, 0.8)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.5rem" }}>
              Layer 4 &bull; Infrastructure
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Engines & Persistence</h3>
            <ul style={{ listStyle: "none", color: "var(--text-secondary)", fontSize: "0.825rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>🐘 PostgreSQL (Prisma ORM + SQL)</li>
              <li>⚡ Redis Cache (24h session TTL)</li>
              <li>🛣️ OSRM Engine (HTTP API)</li>
              <li>🔄 GraphHopper (Failover provider)</li>
              <li>🔍 Photon (Komoot Geocoding)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
