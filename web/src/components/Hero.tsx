"use client";

import React, { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

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
        padding: "4.5rem 1.5rem 3.5rem",
        textAlign: "center",
        maxWidth: "920px",
        margin: "0 auto",
      }}
    >
      {/* Top pill badge */}
      <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "center" }}>
        <div className="badge-pill" style={{ gap: "0.5rem", padding: "0 0.85rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8" }} />
          <span>Built on MapLibre GL &bull; 100% Free &bull; Zero API Keys</span>
        </div>
      </div>

      {/* Main Heading matching mapcn.dev */}
      <h1
        style={{
          fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
          lineHeight: 1.1,
          marginBottom: "1.25rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#ffffff",
        }}
      >
        Beautiful Ethiopian maps, <br />
        made simple
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          color: "var(--muted-foreground)",
          maxWidth: "680px",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        Ready to use, customizable map components and canonical routing APIs for Ethiopia.
        Built on MapLibre GL. No credit cards, no billing limits, zero API keys required.
      </p>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.85rem",
          marginBottom: "1.5rem",
        }}
      >
        <Link
          href="/docs"
          className="btn-mapcn btn-mapcn-primary"
          style={{ minWidth: "140px", height: "2.4rem", fontSize: "0.9rem" }}
        >
          Get Started
        </Link>
        <Link
          href="/#sandbox"
          className="btn-mapcn btn-mapcn-outline"
          style={{ minWidth: "140px", height: "2.4rem", fontSize: "0.9rem" }}
        >
          View Components
        </Link>
      </div>

      {/* Agent prompt / cURL pill button matching mapcn.dev */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={copyCommand}
          className="btn-mapcn btn-mapcn-ghost"
          style={{
            height: "1.85rem",
            padding: "0 0.85rem",
            fontSize: "0.75rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            gap: "0.45rem",
            color: copiedCmd ? "#34d399" : "var(--muted-foreground)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>{copiedCmd ? "Copied curl command to clipboard!" : "Copy curl style command"}</span>
        </button>
      </div>
    </section>
  );
}
