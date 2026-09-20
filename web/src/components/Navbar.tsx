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
        setApiStatus("online");
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
        height: "3.5rem",
        width: "100%",
        backgroundColor: "rgba(9, 9, 11, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="container-mapcn"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Brand & Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "-0.015em",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Open Ethiopia Map</span>
          </Link>

          {/* Vertical Separator */}
          <div
            style={{
              width: "1px",
              height: "1rem",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              margin: "0 0.65rem",
            }}
            className="hidden-mobile"
          />

          {/* Nav links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
            className="hidden-mobile"
          >
            <Link
              href="/docs"
              className="btn-mapcn btn-mapcn-ghost"
              style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.825rem" }}
            >
              Docs
            </Link>
            <Link
              href="/docs#components"
              className="btn-mapcn btn-mapcn-ghost"
              style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.825rem" }}
            >
              Components
            </Link>
            <Link
              href="/#sandbox"
              className="btn-mapcn btn-mapcn-ghost"
              style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.825rem" }}
            >
              Sandbox
            </Link>
            <Link
              href="/docs#api-reference"
              className="btn-mapcn btn-mapcn-ghost"
              style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.825rem" }}
            >
              API Reference
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Quick Search Button */}
          <button
            className="btn-mapcn btn-mapcn-outline hidden-mobile"
            style={{
              height: "2rem",
              padding: "0 0.75rem",
              fontSize: "0.8rem",
              color: "var(--muted-foreground)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "160px",
              justifyContent: "space-between",
            }}
            onClick={() => {
              const el = document.getElementById("search-input");
              if (el) el.focus();
              else window.location.href = "/#sandbox";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search...
            </span>
            <kbd
              style={{
                fontSize: "0.65rem",
                padding: "1px 5px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--muted-foreground)",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* GitHub Star Pill */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-mapcn btn-mapcn-ghost"
            style={{
              height: "2rem",
              padding: "0 0.65rem",
              fontSize: "0.8rem",
              color: "var(--foreground)",
              gap: "0.45rem",
            }}
            title="GitHub Repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>1.4k</span>
          </a>

          {/* Service Status Badge */}
          <div
            className="badge-pill"
            style={{
              borderColor: apiStatus === "online" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
              color: apiStatus === "online" ? "#34d399" : "#f87171",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: apiStatus === "online" ? "#10b981" : "#ef4444",
                display: "inline-block",
              }}
            />
            <span>{apiStatus === "online" ? "Online" : "Connecting"}</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-mapcn btn-mapcn-ghost visible-mobile"
            style={{ height: "2rem", width: "2rem", padding: 0 }}
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "3.5rem",
            left: 0,
            right: 0,
            background: "#09090b",
            borderBottom: "1px solid var(--border)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-mapcn btn-mapcn-ghost"
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            Documentation
          </Link>
          <Link
            href="/docs#components"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-mapcn btn-mapcn-ghost"
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            Components
          </Link>
          <Link
            href="/#sandbox"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-mapcn btn-mapcn-ghost"
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            Interactive Sandbox
          </Link>
          <Link
            href="/docs#api-reference"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-mapcn btn-mapcn-ghost"
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            API Reference
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .visible-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
