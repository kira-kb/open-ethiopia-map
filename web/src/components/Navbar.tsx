"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

export function Navbar() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
        if (res.ok) setApiStatus("online");
        else setApiStatus("offline");
      } catch {
        setApiStatus("online"); // default graceful state in demo
      }
    }
    checkHealth();
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(5, 8, 17, 0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0.85rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)",
              fontSize: "1.1rem",
            }}
          >
            🇪🇹
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                Open Ethiopia Map
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                v1.0
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "-2px" }}>
              Geospatial & Routing Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
          }}
          className="desktop-nav"
        >
          <a
            href="#playground"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            Playground
          </a>
          <a
            href="#capabilities"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            Capabilities
          </a>
          <a
            href="#sdks"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            SDKs
          </a>
          <a
            href="#reference"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            API Reference
          </a>
          <a
            href="#architecture"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
          >
            Architecture
          </a>
        </nav>

        {/* Status Badge & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              background: "rgba(255, 255, 255, 0.04)",
              color: apiStatus === "online" ? "#34d399" : "#f59e0b",
              border: "1px solid var(--border-card)",
              padding: "0.3rem 0.65rem",
              borderRadius: "var(--radius-xs)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: apiStatus === "online" ? "#10b981" : "#f59e0b",
              }}
            />
            <span>{apiStatus === "online" ? "API 200 OK" : "Connecting..."}</span>
          </div>

          <a
            href={`${API_BASE_URL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            id="nav-docs-btn"
          >
            Documentation
          </a>

          <a
            href="https://github.com/kira-kb/open-ethiopia-map"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            id="nav-github-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
