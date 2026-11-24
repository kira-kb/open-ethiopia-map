"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api-config";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  role: "service" | "public" | "admin";
  rateLimit: number;
  allowedOrigins?: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
}

export default function PortalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("kirubelbewket@gmail.com");
  const [password, setPassword] = useState("Pass@123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Create modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRole, setNewKeyRole] = useState<"service" | "public">("service");
  const [newKeyRate, setNewKeyRate] = useState(600);
  const [newKeyOrigins, setNewKeyOrigins] = useState("*");

  const effectiveApiBase = typeof window !== "undefined" && window.location.port === "8084"
    ? window.location.origin
    : API_BASE_URL;

  useEffect(() => {
    const savedToken = localStorage.getItem("ethiopia_map_admin_token");
    if (savedToken) {
      setToken(savedToken);
      fetchKeys(savedToken);
    }
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await fetch(`${effectiveApiBase}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem("ethiopia_map_admin_token", data.token);
        fetchKeys(data.token);
        showToast("Signed in as Admin");
      } else {
        setLoginError(data.error || "Invalid email or password");
      }
    } catch {
      setLoginError("Failed to connect to API Server");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("ethiopia_map_admin_token");
  }

  async function fetchKeys(authToken: string) {
    try {
      const res = await fetch(`${effectiveApiBase}/api/v1/admin/api-keys`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error("Failed to load keys", err);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newKeyName.trim()) return;

    try {
      const origins = newKeyOrigins.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`${effectiveApiBase}/api/v1/admin/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          role: newKeyRole,
          rateLimit: newKeyRate,
          allowedOrigins: origins.length ? origins : ["*"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setNewKeyName("");
        fetchKeys(token);
        showToast(`Created key: ${data.key.name}`);
      }
    } catch {
      alert("Failed to create key");
    }
  }

  async function handleToggleStatus(id: string, currentActive: boolean) {
    if (!token) return;
    try {
      await fetch(`${effectiveApiBase}/api/v1/admin/api-keys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchKeys(token);
      showToast(`Key status updated to ${!currentActive ? "Active" : "Disabled"}`);
    } catch {
      alert("Failed to update status");
    }
  }

  async function handleDeleteKey(id: string) {
    if (!token) return;
    if (!confirm("Are you sure you want to revoke this API key permanently?")) return;

    try {
      await fetch(`${effectiveApiBase}/api/v1/admin/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKeys(token);
      showToast("API key revoked");
    } catch {
      alert("Failed to delete key");
    }
  }

  function copyToClipboard(str: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(str);
      showToast("API Key copied to clipboard!");
    }
  }

  const serviceKeysCount = keys.filter((k) => k.role === "service").length;
  const publicKeysCount = keys.filter((k) => k.role === "public").length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#090d16", color: "#f3f4f6" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "3rem 1.5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {!token ? (
          /* Sign In Screen */
          <div
            style={{
              maxWidth: "440px",
              margin: "3rem auto",
              padding: "2.5rem",
              background: "rgba(22, 28, 45, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "linear-gradient(135deg, #10b981, #065f46)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
                }}
              >
                <span style={{ fontSize: "22px" }}>🔑</span>
              </div>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Developer Portal</h2>
                <p style={{ fontSize: "0.825rem", color: "#9ca3af" }}>Sign in to manage API Keys & Scopes</p>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              {loginError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#10b981",
                  color: "#064e3b",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {loading ? "Authenticating..." : "Sign In to Portal"}
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Screen */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Open Ethiopia Map — API Key Portal</h1>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Canonical Spatial Authority & API Credential Governance</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "0.4rem 1rem",
                    borderRadius: "9999px",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }}></span>
                  <span>kirubelbewket@gmail.com</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              <div style={{ background: "rgba(22,28,45,0.75)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Total Provisioned Keys</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{keys.length}</div>
              </div>
              <div style={{ background: "rgba(22,28,45,0.75)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Backend Service Keys (sk_live)</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#34d399" }}>{serviceKeysCount}</div>
              </div>
              <div style={{ background: "rgba(22,28,45,0.75)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Frontend Public Keys (pk_live)</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#60a5fa" }}>{publicKeysCount}</div>
              </div>
            </div>

            {/* Key List Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Active Client & Microservice Keys</h2>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  background: "#10b981",
                  color: "#064e3b",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Generate New Key
              </button>
            </div>

            {/* Keys Table */}
            <div style={{ background: "rgba(22,28,45,0.75)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>Project / Name</th>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>Scope</th>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>API Key</th>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>Rate Limit</th>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>Status</th>
                    <th style={{ padding: "0.9rem 1.2rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "1rem 1.2rem" }}>
                        <div style={{ fontWeight: 700 }}>{k.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{new Date(k.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "1rem 1.2rem" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: k.role === "service" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                            color: k.role === "service" ? "#34d399" : "#60a5fa",
                          }}
                        >
                          {k.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.2rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.35)", padding: "4px 8px", borderRadius: "6px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                            {k.key.substring(0, 14)}••••••••
                          </span>
                          <button
                            onClick={() => copyToClipboard(k.key)}
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "none",
                              color: "#fff",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.2rem", fontSize: "0.85rem" }}>{k.rateLimit} req/min</td>
                      <td style={{ padding: "1rem 1.2rem" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: k.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: k.isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {k.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.2rem" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleToggleStatus(k.id, k.isActive)}
                            style={{
                              padding: "4px 8px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "#fff",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            {k.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            style={{
                              padding: "4px 8px",
                              background: "rgba(239,68,68,0.15)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: "6px",
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                background: "#131b2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "2rem",
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Generate New API Key</h3>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
                Select whether this key is for Backend microservices (Ride/Delivery) or Mobile/Web MapLibre apps.
              </p>

              <form onSubmit={handleCreateKey}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Project / Application Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Addis Ababa Bajaj Fleet"
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Security Scope / Type
                  </label>
                  <select
                    value={newKeyRole}
                    onChange={(e) => setNewKeyRole(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  >
                    <option value="service">Service (Backend: Full Routing, Telemetry & Sessions)</option>
                    <option value="public">Public (Frontend: Read-only Vector Tiles & Autocomplete)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Rate Limit (Requests per min)
                  </label>
                  <input
                    type="number"
                    value={newKeyRate}
                    onChange={(e) => setNewKeyRate(parseInt(e.target.value, 10))}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: "0.6rem 1rem",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.6rem 1.2rem",
                      background: "#10b981",
                      border: "none",
                      borderRadius: "8px",
                      color: "#064e3b",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Create Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              background: "#10b981",
              color: "#064e3b",
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
              zIndex: 200,
            }}
          >
            {toastMsg}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
