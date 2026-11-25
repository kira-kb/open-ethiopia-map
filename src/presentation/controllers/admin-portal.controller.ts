import { Request, Response } from "express";
import { ApiKeyStore } from "../../infrastructure/database/api-key.store";
import { AdminAuthService } from "../../application/services/admin-auth.service";
import { Logger } from "../../domain/interfaces";

export class AdminPortalController {
  constructor(
    private readonly apiKeyStore: ApiKeyStore,
    private readonly adminAuthService: AdminAuthService,
    private readonly logger?: Logger
  ) {}

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const result = this.adminAuthService.login(email, password);
      if (!result) {
        this.logger?.warn("Failed admin login attempt", { email, ip: req.ip });
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      this.logger?.info("Successful admin login", { email: result.user.email });
      res.json({
        success: true,
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error during login" });
    }
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    const adminUser = (req as any).adminUser;
    res.json({
      success: true,
      user: adminUser || { email: "kirubelbewket@gmail.com", role: "admin" },
    });
  }

  public async listKeys(req: Request, res: Response): Promise<void> {
    try {
      const keys = await this.apiKeyStore.listAll();
      res.json({
        success: true,
        count: keys.length,
        keys: keys.map((k) => k.toJSON()),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve API keys" });
    }
  }

  public async createKey(req: Request, res: Response): Promise<void> {
    try {
      const { name, role, rateLimit, allowedOrigins } = req.body || {};
      if (!name || typeof name !== "string") {
        res.status(400).json({ error: "Key name is required" });
        return;
      }

      const validRole = role === "public" ? "public" : "service";
      const newKey = await this.apiKeyStore.create({
        name: name.trim(),
        role: validRole,
        rateLimit: typeof rateLimit === "number" ? rateLimit : undefined,
        allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : ["*"],
      });

      this.logger?.info("Created new API key", {
        id: newKey.id,
        name: newKey.name,
        role: newKey.role,
      });

      res.status(201).json({
        success: true,
        message: "API key created successfully",
        key: newKey.toJSON(),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to create API key" });
    }
  }

  public async updateKey(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, rateLimit, allowedOrigins, isActive } = req.body || {};

      const updated = await this.apiKeyStore.update(id, {
        name,
        rateLimit,
        allowedOrigins,
        isActive,
      });

      if (!updated) {
        res.status(404).json({ error: "API key not found" });
        return;
      }

      res.json({
        success: true,
        message: "API key updated successfully",
        key: updated.toJSON(),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to update API key" });
    }
  }

  public async deleteKey(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await this.apiKeyStore.delete(id);

      if (!deleted) {
        res.status(404).json({ error: "API key not found" });
        return;
      }

      res.json({
        success: true,
        message: "API key revoked and deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete API key" });
    }
  }

  public servePortalPage(req: Request, res: Response): void {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(this.renderPortalHtml());
  }

  private renderPortalHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Ethiopia Map — API Key Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(22, 28, 45, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-glow: rgba(16, 185, 129, 0.25);
      --accent: #3b82f6;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --warning: #f59e0b;
      --surface: #111827;
      --radius: 12px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08) 0%, transparent 40%);
      background-attachment: fixed;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #10b981, #065f46);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px var(--primary-glow);
    }
    .logo-badge svg { width: 24px; height: 24px; fill: white; }
    .brand h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .brand p { font-size: 13px; color: var(--text-muted); }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #064e3b;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-primary:hover {
      background: var(--primary-hover);
      color: white;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .btn-danger {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .btn-danger:hover {
      background: var(--danger);
      color: white;
    }
    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 6px;
    }

    /* Metric Cards */
    .grid-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(16px);
      padding: 22px;
      border-radius: var(--radius);
    }
    .metric-label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    /* Section & Cards */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
    }

    .key-table-wrapper {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(16px);
      border-radius: var(--radius);
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: rgba(0, 0, 0, 0.25);
      padding: 14px 18px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 16px 18px;
      font-size: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .key-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: rgba(0, 0, 0, 0.35);
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-service {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-public {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .badge-active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .badge-disabled {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Modal */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 100;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: #131b2e;
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      width: 100%;
      max-width: 520px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .modal-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 22px;
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      outline: none;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 26px;
    }

    /* Login Screen */
    .login-container {
      max-width: 440px;
      margin: 100px auto;
      padding: 36px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }

    /* Integration Snippets */
    .snippet-box {
      background: #0d121f;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #93c5fd;
      overflow-x: auto;
      margin-top: 12px;
    }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #064e3b;
      font-weight: 700;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      display: none;
      z-index: 200;
    }
  </style>
</head>
<body>

  <!-- Login Section -->
  <div id="login-view" class="login-container" style="display: none;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div class="logo-badge"><svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg></div>
      <div>
        <h2 style="font-size: 18px; font-weight: 800;">Open Ethiopia Map</h2>
        <p style="font-size: 12px; color: var(--text-muted);">API Key & Developer Portal</p>
      </div>
    </div>

    <form id="login-form">
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" id="login-email" class="form-input" value="kirubelbewket@gmail.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" id="login-password" class="form-input" value="Pass@123" required>
      </div>
      <div id="login-error" style="color: var(--danger); font-size: 13px; margin-bottom: 14px; display: none;"></div>
      <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">Sign In to Console</button>
    </form>
  </div>

  <!-- Dashboard Section -->
  <div id="dashboard-view" class="container" style="display: none;">
    <header>
      <div class="brand">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
        <div>
          <h1>Open Ethiopia Map Portal</h1>
          <p>National Spatial Authority & API Key Governance</p>
        </div>
      </div>
      <div class="header-actions">
        <a href="/playground" class="btn btn-secondary btn-sm" style="text-decoration:none; color:#38bdf8; border-color: rgba(56,189,248,0.4); display: flex; align-items: center; gap: 6px;">⚡ API Playground</a>
        <div class="user-pill">
          <span class="status-dot"></span>
          <span id="user-display">kirubelbewket@gmail.com</span>
        </div>
        <button id="logout-btn" class="btn btn-secondary btn-sm">Sign Out</button>
      </div>
    </header>

    <!-- Metrics Grid -->
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">Total Provisioned Keys</div>
        <div id="metric-total" class="metric-value">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Backend Service Keys (sk_live)</div>
        <div id="metric-service" class="metric-value" style="color: #34d399;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Frontend Public Keys (pk_live)</div>
        <div id="metric-public" class="metric-value" style="color: #60a5fa;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Routing & Engine Status</div>
        <div class="metric-value" style="color: #10b981; font-size: 20px; display: flex; align-items: center; gap: 8px;">
          <span class="status-dot"></span> Active (OSRM + PMTiles)
        </div>
      </div>
    </div>

    <!-- Keys Table Section -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Active Client & Microservice Keys</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Manage authorization tokens for Ride-Hailing, Delivery, and Mobile MapLibre applications.</p>
      </div>
      <button id="open-create-modal-btn" class="btn btn-primary">+ Generate New Key</button>
    </div>

    <div class="key-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Application / Project</th>
            <th>Type</th>
            <th>API Key</th>
            <th>Rate Limit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="keys-tbody">
          <!-- Populated by JS -->
        </tbody>
      </table>
    </div>

    <!-- Quick Usage Guide -->
    <div style="margin-top: 48px;">
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">⚡ Developer Integration Quick Guide</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Use your provisioned keys to interact with the canonical spatial endpoints.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="metric-card">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Backend Microservice (Routing API)</div>
          <div style="font-size: 12px; color: var(--text-muted);">Pass via <code>X-API-Key</code> or <code>Authorization: Bearer</code> header:</div>
          <div class="snippet-box">
curl -X POST http://localhost:8084/api/v1/map/route \\<br>
&nbsp;&nbsp;-H "X-API-Key: sk_ride_live_addis_..." \\<br>
&nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
&nbsp;&nbsp;-d '{"origin":{"latitude":8.9806,"longitude":38.7997},"destination":{"latitude":9.0300,"longitude":38.7400},"profile":"bajaj"}'
          </div>
        </div>

        <div class="metric-card">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Driver / Customer App (MapLibre Tiles)</div>
          <div style="font-size: 12px; color: var(--text-muted);">Pass via query parameter in vector tile source URL:</div>
          <div class="snippet-box">
map.addSource('ethiopia-streets', {<br>
&nbsp;&nbsp;type: 'vector',<br>
&nbsp;&nbsp;tiles: ['http://localhost:8084/api/v1/map/tiles/vector/{z}/{x}/{y}.pbf?key=pk_driver_live_...'],<br>
&nbsp;&nbsp;maxzoom: 16<br>
});
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Key Modal -->
  <div id="create-modal" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-title">Generate API Key</h3>
      <p class="modal-subtitle">Configure authorization scope and quota for a client project.</p>
      <form id="create-key-form">
        <div class="form-group">
          <label class="form-label">Project / Application Name</label>
          <input type="text" id="key-name" class="form-input" placeholder="e.g. Gondar Delivery Dispatcher" required>
        </div>
        <div class="form-group">
          <label class="form-label">Key Role / Security Scope</label>
          <select id="key-role" class="form-select">
            <option value="service">Service (Backend: Full Route Calculation & Telemetry)</option>
            <option value="public">Public (Mobile/Web: Vector Tiles & Autocomplete Only)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rate Limit (Requests per minute)</label>
          <input type="number" id="key-rate" class="form-input" value="600" min="10" max="10000">
        </div>
        <div class="form-group">
          <label class="form-label">Allowed Origins (Optional for web, comma-separated)</label>
          <input type="text" id="key-origins" class="form-input" value="*" placeholder="* or https://app.example.com">
        </div>
        <div class="modal-footer">
          <button type="button" id="close-create-modal-btn" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Key</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="toast">Copied to clipboard!</div>

  <script>
    const API_BASE = window.location.origin;
    let authToken = localStorage.getItem('ethiopia_map_admin_token');

    // UI Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const keysTbody = document.getElementById('keys-tbody');
    const logoutBtn = document.getElementById('logout-btn');
    const toast = document.getElementById('toast');
    const createModal = document.getElementById('create-modal');
    const openCreateModalBtn = document.getElementById('open-create-modal-btn');
    const closeCreateModalBtn = document.getElementById('close-create-modal-btn');
    const createKeyForm = document.getElementById('create-key-form');

    function showToast(msg) {
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2200);
    }

    function checkAuth() {
      if (authToken) {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        loadKeys();
      } else {
        loginView.style.display = 'block';
        dashboardView.style.display = 'none';
      }
    }

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(\`\${API_BASE}/api/v1/admin/auth/login\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.token) {
          authToken = data.token;
          localStorage.setItem('ethiopia_map_admin_token', authToken);
          checkAuth();
        } else {
          loginError.textContent = data.error || 'Invalid credentials';
          loginError.style.display = 'block';
        }
      } catch (err) {
        loginError.textContent = 'Server connection error';
        loginError.style.display = 'block';
      }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
      authToken = null;
      localStorage.removeItem('ethiopia_map_admin_token');
      checkAuth();
    });

    // Load Keys
    async function loadKeys() {
      try {
        const res = await fetch(\`\${API_BASE}/api/v1/admin/api-keys\`, {
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });
        if (res.status === 401) {
          logoutBtn.click();
          return;
        }
        const data = await res.json();
        renderKeys(data.keys || []);
      } catch (err) {
        console.error('Failed to load keys', err);
      }
    }

    function renderKeys(keys) {
      keysTbody.innerHTML = '';
      let serviceCount = 0;
      let publicCount = 0;

      keys.forEach(k => {
        if (k.role === 'service') serviceCount++;
        else publicCount++;

        const tr = document.createElement('tr');
        const roleBadge = k.role === 'service' 
          ? '<span class="badge badge-service">Service</span>' 
          : '<span class="badge badge-public">Public</span>';
        
        const statusBadge = k.isActive 
          ? '<span class="badge badge-active">Active</span>' 
          : '<span class="badge badge-disabled">Disabled</span>';

        tr.innerHTML = \`
          <td>
            <div style="font-weight: 700;">\${escapeHtml(k.name)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Created: \${new Date(k.createdAt).toLocaleDateString()}</div>
          </td>
          <td>\${roleBadge}</td>
          <td>
            <div class="key-mono">
              <span>\${k.key.substring(0, 14)}••••••••</span>
              <button class="btn btn-secondary btn-sm" onclick="copyKey('\${k.key}')">Copy</button>
            </div>
          </td>
          <td>\${k.rateLimit} req/min</td>
          <td>\${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="toggleKeyStatus('\${k.id}', \${!k.isActive})">
                \${k.isActive ? 'Disable' : 'Enable'}
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteKey('\${k.id}')">Revoke</button>
            </div>
          </td>
        \`;
        keysTbody.appendChild(tr);
      });

      document.getElementById('metric-total').textContent = keys.length;
      document.getElementById('metric-service').textContent = serviceCount;
      document.getElementById('metric-public').textContent = publicCount;
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    window.copyKey = function(key) {
      navigator.clipboard.writeText(key).then(() => {
        showToast('API Key copied to clipboard!');
      });
    };

    window.toggleKeyStatus = async function(id, isActive) {
      try {
        await fetch(\`\${API_BASE}/api/v1/admin/api-keys/\${id}\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${authToken}\`
          },
          body: JSON.stringify({ isActive })
        });
        loadKeys();
        showToast(\`Key status updated to \${isActive ? 'Active' : 'Disabled'}\`);
      } catch (err) {
        alert('Failed to update status');
      }
    };

    window.deleteKey = async function(id) {
      if (!confirm('Are you sure you want to permanently revoke this key?')) return;
      try {
        await fetch(\`\${API_BASE}/api/v1/admin/api-keys/\${id}\`, {
          method: 'DELETE',
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });
        loadKeys();
        showToast('API Key permanently revoked');
      } catch (err) {
        alert('Failed to delete key');
      }
    };

    // Modal Events
    openCreateModalBtn.addEventListener('click', () => { createModal.style.display = 'flex'; });
    closeCreateModalBtn.addEventListener('click', () => { createModal.style.display = 'none'; });
    createModal.addEventListener('click', (e) => {
      if (e.target === createModal) createModal.style.display = 'none';
    });

    createKeyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('key-name').value;
      const role = document.getElementById('key-role').value;
      const rateLimit = parseInt(document.getElementById('key-rate').value, 10);
      const origins = document.getElementById('key-origins').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      try {
        const res = await fetch(\`\${API_BASE}/api/v1/admin/api-keys\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${authToken}\`
          },
          body: JSON.stringify({ name, role, rateLimit, allowedOrigins: origins })
        });
        const data = await res.json();
        if (data.success) {
          createModal.style.display = 'none';
          createKeyForm.reset();
          loadKeys();
          showToast(\`Key generated: \${data.key.name}\`);
        }
      } catch (err) {
        alert('Error creating API key');
      }
    });

    // Initialize
    checkAuth();
  </script>
</body>
</html>`;
  }

  public servePlaygroundPage(req: Request, res: Response): void {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(this.renderPlaygroundHtml());
  }

  private renderPlaygroundHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Ethiopia Map — API Playground</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(22, 28, 45, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-glow: rgba(16, 185, 129, 0.25);
      --accent: #38bdf8;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --surface: #111827;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
      background-image: 
        radial-gradient(circle at 10% 10%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 40%);
      background-attachment: fixed;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px 20px; }
    header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 20px; border-bottom: 1px solid var(--card-border); margin-bottom: 24px;
    }
    .brand { display: flex; align-items: center; gap: 14px; }
    .logo-badge {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #38bdf8, #0284c7);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .brand h1 { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { font-size: 12px; color: var(--text-muted); }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .key-bar {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255, 255, 255, 0.04); padding: 6px 12px;
      border-radius: 8px; border: 1px solid var(--card-border);
    }
    .key-bar input {
      background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px; color: #10b981; font-family: 'JetBrains Mono', monospace;
      font-size: 13px; padding: 5px 10px; width: 280px; outline: none;
    }
    .btn {
      padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent;
      display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
    }
    .btn-primary { background: var(--primary); color: #022c22; font-weight: 700; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: transparent; border-color: var(--card-border); color: var(--text); }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.05); }

    /* Scenario Carousel */
    .scenarios-row {
      display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 20px;
    }
    .scenario-btn {
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--card-border);
      color: var(--text-muted); border-radius: 8px; padding: 7px 12px;
      font-size: 13px; font-weight: 600; white-space: nowrap; cursor: pointer;
    }
    .scenario-btn.active {
      background: rgba(56, 189, 248, 0.15); border-color: var(--accent); color: #ffffff;
    }

    /* Main Grid */
    .playground-grid {
      display: grid; grid-template-columns: 1fr 1.15fr; gap: 20px;
    }
    .panel {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: var(--radius); padding: 20px; backdrop-filter: blur(12px);
    }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
    }
    .path-row {
      display: flex; gap: 8px; margin-bottom: 14px;
    }
    .path-row select {
      background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
      color: #38bdf8; font-weight: 700; border-radius: 6px; padding: 8px 12px; outline: none;
    }
    .path-row input {
      flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
      color: #ffffff; font-family: 'JetBrains Mono', monospace; font-size: 13px;
      border-radius: 6px; padding: 8px 12px; outline: none;
    }
    textarea.code-area {
      width: 100%; height: 380px; background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
      color: #f3f4f6; font-family: 'JetBrains Mono', monospace; font-size: 13px;
      padding: 12px; line-height: 1.5; resize: vertical; outline: none; margin-bottom: 14px;
    }
    pre.output-area {
      background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px; color: #f3f4f6; font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px; padding: 14px; max-height: 480px; overflow: auto;
      line-height: 1.5; margin: 0;
    }
    .badge {
      display: inline-block; padding: 3px 8px; border-radius: 9999px;
      font-size: 11px; font-weight: 700;
    }
    .badge-ok { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge-err { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .badge-ms { background: rgba(255,255,255,0.08); color: #38bdf8; }
    .maneuver-item {
      padding: 6px 10px; background: rgba(0,0,0,0.25); border-radius: 6px;
      font-size: 13px; display: flex; gap: 8px; margin-bottom: 4px;
    }
    .maneuver-item span.num { color: #10b981; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo-badge">⚡</div>
        <div>
          <h1>Open Ethiopia Map — API Playground</h1>
          <p>Interactive Spatial Request & Benchmark Console</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="key-bar">
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">API Key:</span>
          <input id="api-key-input" type="text" value="sk_delivery_live_gondar_3b1c559812a4">
        </div>
        <a href="/portal" class="btn btn-outline">🔑 Developer Portal</a>
      </div>
    </header>

    <!-- Scenarios -->
    <div class="scenarios-row" id="scenarios-container">
      <!-- Injected by JS -->
    </div>

    <!-- Playground Form & Output -->
    <div class="playground-grid">
      <!-- Left: Request -->
      <div class="panel">
        <div class="panel-header">
          <div style="font-size: 14px; font-weight: 700;">Request Configuration</div>
          <span id="scenario-hint" style="font-size: 12px; color: var(--text-muted);">Select a preset above</span>
        </div>

        <div class="path-row">
          <select id="req-method">
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
          <input id="req-path" type="text" value="/api/v1/map/route">
        </div>

        <textarea id="req-body" class="code-area"></textarea>

        <button id="send-btn" class="btn btn-primary" style="width: 100%; height: 42px; justify-content: center; font-size: 14px;">
          🚀 Send Request (Execute)
        </button>
      </div>

      <!-- Right: Response -->
      <div class="panel">
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: 700;">Live Response</span>
            <span id="status-badge" class="badge" style="display: none;"></span>
            <span id="timing-badge" class="badge badge-ms" style="display: none;"></span>
          </div>
          <button id="copy-btn" class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;">Copy Output</button>
        </div>

        <div id="visual-output" style="margin-bottom: 12px; display: none;"></div>
        <pre id="json-output" class="output-area">Click "Send Request" to compute route on the Ethiopian road network.</pre>
      </div>
    </div>
  </div>

  <script>
    const SCENARIOS = [
      {
        name: "🚕 Addis: Bole → Kazanchis (Car)",
        method: "POST",
        path: "/api/v1/map/route",
        body: {
          origin: { latitude: 8.9806, longitude: 38.7578 },
          destination: { latitude: 9.0195, longitude: 38.7710 },
          profile: "car",
          lang: "en",
          steps: true
        }
      },
      {
        name: "🛺 Gondar: Arada → Kebele 18 (Bajaj)",
        method: "POST",
        path: "/api/v1/map/route",
        body: {
          origin: { latitude: 12.6078, longitude: 37.4697 },
          destination: { latitude: 12.6180, longitude: 37.4580 },
          profile: "bajaj",
          lang: "en",
          steps: true
        }
      },
      {
        name: "🇪🇹 Amharic Navigation (lang: 'am')",
        method: "POST",
        path: "/api/v1/map/route",
        body: {
          origin: { latitude: 9.0108, longitude: 38.7615 },
          destination: { latitude: 8.9806, longitude: 38.7578 },
          profile: "car",
          lang: "am",
          steps: true
        }
      },
      {
        name: "⚡ Distance Matrix (3 Drivers → 1 Pickup)",
        method: "POST",
        path: "/api/v1/map/matrix",
        body: {
          origins: [
            { latitude: 9.0120, longitude: 38.7600 },
            { latitude: 9.0150, longitude: 38.7700 },
            { latitude: 9.0200, longitude: 38.7800 }
          ],
          destinations: [
            { latitude: 9.0108, longitude: 38.7615 }
          ],
          profile: "car"
        }
      },
      {
        name: "📦 Pack-Man Dispatch (Road ETA Ranking)",
        method: "POST",
        path: "/api/v1/map/dispatch/nearby",
        body: {
          pickup: { latitude: 9.0108, longitude: 38.7615 },
          vehicleType: "bajaj",
          deliveryId: "del_109283",
          radiusKm: 5,
          limit: 5,
          candidates: [
            { driverId: "drv_01", latitude: 9.0130, longitude: 38.7615, vehicleType: "BAJAJ" },
            { driverId: "drv_02", latitude: 9.0180, longitude: 38.7615, vehicleType: "BAJAJ" }
          ]
        }
      },
      {
        name: "📍 Snap GPS to Road (/match)",
        method: "POST",
        path: "/api/v1/map/match",
        body: {
          coordinates: [
            { latitude: 9.0108, longitude: 38.7615, timestamp: 1711200000 },
            { latitude: 9.0112, longitude: 38.7620, timestamp: 1711200005 }
          ],
          profile: "car"
        }
      },
      {
        name: "🔍 Autocomplete Search",
        method: "GET",
        path: "/api/v1/map/autocomplete?q=Bole+Medhanialem&limit=5"
      }
    ];

    const scenariosContainer = document.getElementById('scenarios-container');
    const reqMethod = document.getElementById('req-method');
    const reqPath = document.getElementById('req-path');
    const reqBody = document.getElementById('req-body');
    const apiKeyInput = document.getElementById('api-key-input');
    const sendBtn = document.getElementById('send-btn');
    const statusBadge = document.getElementById('status-badge');
    const timingBadge = document.getElementById('timing-badge');
    const jsonOutput = document.getElementById('json-output');
    const visualOutput = document.getElementById('visual-output');
    const copyBtn = document.getElementById('copy-btn');

    let currentResponseData = null;

    function renderScenarios() {
      scenariosContainer.innerHTML = '';
      SCENARIOS.forEach((sc, idx) => {
        const btn = document.createElement('button');
        btn.className = 'scenario-btn' + (idx === 0 ? ' active' : '');
        btn.innerText = sc.name;
        btn.onclick = () => selectScenario(sc, btn);
        scenariosContainer.appendChild(btn);
      });
      selectScenario(SCENARIOS[0], scenariosContainer.children[0]);
    }

    function selectScenario(sc, btnEl) {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      reqMethod.value = sc.method;
      reqPath.value = sc.path;
      if (sc.body) {
        reqBody.value = JSON.stringify(sc.body, null, 2);
        reqBody.style.display = 'block';
      } else {
        reqBody.value = '';
        reqBody.style.display = 'none';
      }
    }

    sendBtn.onclick = async () => {
      sendBtn.disabled = true;
      sendBtn.innerText = 'Traversing Road Network...';
      statusBadge.style.display = 'none';
      timingBadge.style.display = 'none';
      visualOutput.style.display = 'none';
      visualOutput.innerHTML = '';

      const start = performance.now();
      const path = reqPath.value.trim();
      const method = reqMethod.value;
      const key = apiKeyInput.value.trim();

      try {
        const headers = { 'X-API-Key': key };
        const opts = { method, headers };

        if (method === 'POST' && reqBody.value.trim()) {
          headers['Content-Type'] = 'application/json';
          opts.body = reqBody.value.trim();
        }

        const res = await fetch(path, opts);
        const elapsed = Math.round(performance.now() - start);

        statusBadge.style.display = 'inline-block';
        statusBadge.className = 'badge ' + (res.ok ? 'badge-ok' : 'badge-err');
        statusBadge.innerText = \`\${res.status} \${res.statusText}\`;

        timingBadge.style.display = 'inline-block';
        timingBadge.innerText = \`⚡ \${elapsed} ms\`;

        const data = await res.json();
        currentResponseData = data;
        jsonOutput.innerText = JSON.stringify(data, null, 2);

        // Visual Turn-by-Turn Maneuvers
        if (data && Array.isArray(data.instructions) && data.instructions.length > 0) {
          visualOutput.style.display = 'block';
          visualOutput.innerHTML = \`<div style="font-size: 12px; font-weight:700; color:#10b981; margin-bottom:6px;">📍 TURN-BY-TURN STEPS:</div>\` +
            data.instructions.slice(0, 4).map((inst, i) => {
              const txt = typeof inst === 'string' ? inst : inst.text || JSON.stringify(inst);
              return \`<div class="maneuver-item"><span class="num">\${i+1}.</span> <span>\${txt}</span></div>\`;
            }).join('');
        }

        // Visual Dispatch Leaderboard
        if (data && Array.isArray(data.candidates) && data.candidates.length > 0) {
          visualOutput.style.display = 'block';
          visualOutput.innerHTML = \`<div style="font-size: 12px; font-weight:700; color:#38bdf8; margin-bottom:6px;">🏆 RANKED DRIVERS (ROAD ETA):</div>\` +
            data.candidates.map((c, i) => {
              return \`<div class="maneuver-item" style="justify-content:space-between;">
                <div><span class="num">#\${i+1}</span> \${c.driverId} (\${c.vehicleType})</div>
                <div style="color:#10b981; font-weight:700;">ETA: \${c.etaMinutes}m (\${c.roadDistanceMeters}m)</div>
              </div>\`;
            }).join('');
        }

      } catch (err) {
        statusBadge.style.display = 'inline-block';
        statusBadge.className = 'badge badge-err';
        statusBadge.innerText = 'Network Error';
        jsonOutput.innerText = JSON.stringify({ error: err.message }, null, 2);
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = '🚀 Send Request (Execute)';
      }
    };

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(jsonOutput.innerText);
      copyBtn.innerText = '✓ Copied';
      setTimeout(() => copyBtn.innerText = 'Copy Output', 2000);
    };

    renderScenarios();
  </script>
</body>
</html>`;
  }
}
