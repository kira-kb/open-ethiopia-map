export function renderDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Open Ethiopia Map & Routing Engine — API Documentation & Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    :root {
      --bg-base: #0a0e17;
      --bg-surface: #111827;
      --bg-card: rgba(17, 24, 39, 0.85);
      --bg-card-hover: rgba(31, 41, 55, 0.7);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.5);
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.35);
      --accent-emerald: #10b981;
      --accent-cyan: #06b6d4;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-full: 9999px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      line-height: 1.5;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 85% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
    }

    /* Top Navigation Header */
    header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(10, 14, 23, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #6366f1 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.3rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: #ffffff;
      background: var(--primary);
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-weight: 500;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Main Container */
    main {
      max-width: 1380px;
      margin: 0 auto;
      padding: 2rem;
    }

    .tab-panel {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-panel.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fff;
    }

    .card-desc {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      font-size: 0.825rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }

    input, select, textarea {
      width: 100%;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      padding: 0.65rem 0.9rem;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.9rem;
      transition: border 0.2s, box-shadow 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--text-main);
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      cursor: pointer;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    }

    .btn-primary:hover {
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-danger {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }

    .btn-danger:hover {
      background: rgba(244, 63, 94, 0.3);
    }

    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.775rem;
      border-radius: 6px;
    }

    .presets-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.4rem;
    }

    .preset-chip {
      font-size: 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .preset-chip:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: var(--primary);
      color: #c7d2fe;
    }

    /* Table Styles */
    .table-container {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: rgba(15, 23, 42, 0.4);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    th {
      background: rgba(30, 41, 59, 0.5);
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border-subtle);
    }

    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      font-size: 0.725rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-primary { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

    /* Code & JSON Previewer */
    .code-block {
      background: #06090e;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #e2e8f0;
      overflow-x: auto;
      max-height: 480px;
    }

    .http-method {
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      display: inline-block;
    }

    .http-get { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .http-post { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .http-put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .http-delete { background: rgba(244, 63, 94, 0.2); color: #fb7185; }

    .endpoint-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      overflow: hidden;
      transition: border 0.2s;
    }

    .endpoint-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .endpoint-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.015);
    }

    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .endpoint-body {
      padding: 1.25rem;
      border-top: 1px solid var(--border-subtle);
      background: rgba(0, 0, 0, 0.15);
      display: none;
    }

    .endpoint-card.open .endpoint-body {
      display: block;
    }

    /* Leaflet Map Styling */
    #liveLeafletMap {
      height: 480px;
      width: 100%;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 10;
    }

    .code-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.5rem;
    }

    .code-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s;
    }

    .code-tab-btn.active {
      color: #fff;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
    }

    .code-snippet-panel {
      display: none;
    }

    .code-snippet-panel.active {
      display: block;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 2000;
      background: #1e293b;
      color: #fff;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      border-left: 4px solid var(--primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    #toast.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 1500;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-overlay.open {
      display: flex;
    }

    .modal-content {
      background: #111827;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 2rem;
      max-width: 540px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
  </style>
</head>
<body>

  <!-- Top Header Navigation -->
  <header>
    <div class="brand-container">
      <div class="brand-logo">🇪🇹</div>
      <div>
        <div class="brand-title">Open Ethiopia Map Platform</div>
        <div class="brand-sub">Routing • Geocoding • Map Tiles • Saved Places</div>
      </div>
    </div>

    <nav class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('tab-crud')">📍 Saved Places CRUD</button>
      <button class="tab-btn" onclick="switchTab('tab-tiles')">🗺️ Map Tiles & SDKs</button>
      <button class="tab-btn" onclick="switchTab('tab-playground')">⚡ API Explorer</button>
      <button class="tab-btn" onclick="switchTab('tab-ingest')">📥 Ingest & Enrichment</button>
      <button class="tab-btn" onclick="switchTab('tab-architecture')">🏛️ Specs</button>
    </nav>

    <div class="status-badge" id="system-health-badge">
      <span class="pulse-dot"></span>
      <span id="health-text">Checking System...</span>
    </div>
  </header>

  <main>

    <!-- TAB 1: SAVED PLACES CRUD MANAGER -->
    <section id="tab-crud" class="tab-panel active">
      <div class="grid-2">
        <!-- Form: Create / Save Place -->
        <div class="card">
          <h2 class="card-title">➕ Add New Saved Place</h2>
          <p class="card-desc">Save customized delivery addresses, branches, warehouses, or customer locations to PostgreSQL.</p>
          
          <form id="createPlaceForm" onsubmit="handleCreatePlace(event)">
            <div class="form-row">
              <div class="form-group">
                <label for="f_userId">User ID *</label>
                <input type="text" id="f_userId" value="user-dev-01" required />
              </div>
              <div class="form-group">
                <label for="f_label">Label * (e.g. Home, Office, Branch)</label>
                <input type="text" id="f_label" placeholder="e.g. Bole Branch" required />
              </div>
            </div>

            <div class="form-group">
              <label for="f_name">Display Name</label>
              <input type="text" id="f_name" placeholder="e.g. PackMan Bole Hub, 2nd Floor" />
            </div>

            <div class="form-group">
              <label for="f_address">Full Address / Landmark</label>
              <input type="text" id="f_address" placeholder="e.g. Cameroon St, next to Edna Mall, Bole" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="f_city">City</label>
                <input type="text" id="f_city" value="Addis Ababa" />
              </div>
              <div class="form-group">
                <label for="f_locationType">Location Type</label>
                <select id="f_locationType">
                  <option value="OFFICE_BUILDING">Office Building</option>
                  <option value="SHOPPING_MALL">Shopping Mall</option>
                  <option value="CONDOMINIUM">Condominium</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BANK">Bank</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="HOUSE">House / Villa</option>
                  <option value="LANDMARK">Landmark</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="f_lat">Latitude *</label>
                <input type="number" step="any" id="f_lat" value="8.9892" required />
              </div>
              <div class="form-group">
                <label for="f_lng">Longitude *</label>
                <input type="number" step="any" id="f_lng" value="38.7885" required />
              </div>
            </div>

            <div class="form-group">
              <label>Quick Addis Ababa Coordinates</label>
              <div class="presets-container">
                <span class="preset-chip" onclick="setFormCoords(8.9806, 38.7578, 'Meskel Square', 'Meskel Square, Addis Ababa')">Meskel Square</span>
                <span class="preset-chip" onclick="setFormCoords(8.9774, 38.7993, 'Bole Int Airport', 'Bole International Airport')">Bole Airport</span>
                <span class="preset-chip" onclick="setFormCoords(9.0350, 38.7525, 'Piassa De Gaulle', 'Piassa, Arada')">Piassa</span>
                <span class="preset-chip" onclick="setFormCoords(9.0305, 38.7390, 'Merkato Grand Market', 'Addis Ketema, Merkato')">Merkato</span>
                <span class="preset-chip" onclick="setFormCoords(9.0150, 38.7660, 'Kazanchis Business Dist', 'Kazanchis, Kirkos')">Kazanchis</span>
                <span class="preset-chip" onclick="setFormCoords(9.0062, 38.8681, 'CMC Real Estate', 'CMC, Bole/Yeka')">CMC</span>
                <span class="preset-chip" onclick="setFormCoords(8.9950, 38.7320, 'Sarbet / AU', 'Sarbet, Kirkos')">Sarbet</span>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="f_isDefault" />
                Set as Default Address for this User
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              💾 Save Place (POST /api/v1/map/saved-places)
            </button>
          </form>
        </div>

        <!-- Data Table: List / Read / Update / Delete -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h2 class="card-title">📋 Saved Places Directory</h2>
              <p class="card-desc" style="margin-bottom: 0;">Live database records retrieved from PostgreSQL</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="text" id="filter_userId" value="user-dev-01" placeholder="Filter by User ID" style="width: 140px; padding: 0.4rem 0.6rem; font-size: 0.8rem;" />
              <button class="btn btn-secondary btn-sm" onclick="loadSavedPlaces()">🔄 Refresh</button>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Label / Name</th>
                  <th>Location Type</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="placesTableBody">
                <tr>
                  <td colspan="4" style="text-align: center; color: var(--text-dim); padding: 2rem;">Loading places...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: MAP TILES & CLIENT INTEGRATION GUIDE -->
    <section id="tab-tiles" class="tab-panel">
      <div class="grid-2">
        <!-- Live Map Interactive Canvas -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h2 class="card-title" style="margin-bottom: 0;">🗺️ Live Map Tile Renderer</h2>
              <p class="card-desc" style="margin-bottom: 0;">Powered by <code>/api/v1/map/tiles/{style}/{z}/{x}/{y}.png</code></p>
            </div>
            <div style="display: flex; gap: 0.3rem;">
              <button class="btn btn-secondary btn-sm" onclick="setTileLayerStyle('dark')">🌙 Dark</button>
              <button class="btn btn-secondary btn-sm" onclick="setTileLayerStyle('voyager')">🗺️ Street</button>
              <button class="btn btn-secondary btn-sm" onclick="setTileLayerStyle('light')">☀️ Light</button>
              <button class="btn btn-secondary btn-sm" onclick="setTileLayerStyle('osm')">🌍 OSM</button>
            </div>
          </div>

          <div id="liveLeafletMap"></div>

          <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
            <div>📍 Click anywhere on the map to reverse geocode & inspect coordinates.</div>
            <button class="btn btn-primary btn-sm" onclick="drawDemoRoute()">🚗 Draw Demo Route</button>
          </div>
        </div>

        <!-- Code Snippets for React, React Native, Plain HTML -->
        <div class="card">
          <h2 class="card-title">💻 Client Rendering Integration Guide</h2>
          <p class="card-desc">How to render these map tiles and routes in your web and mobile applications.</p>

          <div class="code-tabs">
            <button class="code-tab-btn active" onclick="switchCodeTab('code-react')">⚛️ React</button>
            <button class="code-tab-btn" onclick="switchCodeTab('code-native')">📱 React Native</button>
            <button class="code-tab-btn" onclick="switchCodeTab('code-html')">🌐 Plain HTML / JS</button>
            <button class="code-tab-btn" onclick="switchCodeTab('code-flutter')">💙 Flutter</button>
          </div>

          <!-- Code Panel: React -->
          <div id="code-react" class="code-snippet-panel active">
            <pre class="code-block">// 1. Install Leaflet & React-Leaflet
// npm install leaflet react-leaflet

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EthiopiaMap() {
  const tileUrl = "https://open-ethiopia-map-isf6.vercel.app/api/v1/map/tiles/dark/{z}/{x}/{y}.png";

  return (
    &lt;MapContainer center={[9.0105, 38.7612]} zoom={13} style={{ height: "400px", width: "100%" }}&gt;
      &lt;TileLayer
        url={tileUrl}
        attribution='&copy; Open Ethiopia Map'
      /&gt;
      &lt;Marker position={[8.9806, 38.7578]}&gt;
        &lt;Popup&gt;Meskel Square, Addis Ababa&lt;/Popup&gt;
      &lt;/Marker&gt;
    &lt;/MapContainer&gt;
  );
}</pre>
          </div>

          <!-- Code Panel: React Native -->
          <div id="code-native" class="code-snippet-panel">
            <pre class="code-block">// 1. Install react-native-maps
// npm install react-native-maps

import React from "react";
import MapView, { UrlTile, Marker, Polyline } from "react-native-maps";
import { StyleSheet, View } from "react-native";

export default function MobileMap() {
  const tileUrlTemplate = "https://open-ethiopia-map-isf6.vercel.app/api/v1/map/tiles/dark/{z}/{x}/{y}.png";

  return (
    &lt;View style={styles.container}&gt;
      &lt;MapView
        style={styles.map}
        initialRegion={{
          latitude: 9.0105,
          longitude: 38.7612,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      &gt;
        &lt;UrlTile
          urlTemplate={tileUrlTemplate}
          maximumZ={19}
          flipY={false}
          zIndex={1}
        /&gt;
        &lt;Marker
          coordinate={{ latitude: 8.9806, longitude: 38.7578 }}
          title="Meskel Square"
        /&gt;
      &lt;/MapView&gt;
    &lt;/View&gt;
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});</pre>
          </div>

          <!-- Code Panel: Plain HTML -->
          <div id="code-html" class="code-snippet-panel">
            <pre class="code-block">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;Addis Ababa Map&lt;/title&gt;
  &lt;link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /&gt;
  &lt;script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"&gt;&lt;/script&gt;
  &lt;style&gt;
    #map { height: 500px; width: 100%; border-radius: 12px; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div id="map"&gt;&lt;/div&gt;
  &lt;script&gt;
    const map = L.map('map').setView([9.0105, 38.7612], 13);
    
    // Use Open Ethiopia Map Tile API (styles: dark, light, voyager, osm)
    L.tileLayer('https://open-ethiopia-map-isf6.vercel.app/api/v1/map/tiles/dark/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; Open Ethiopia Map'
    }).addTo(map);

    L.marker([8.9806, 38.7578]).addTo(map)
      .bindPopup('Meskel Square, Addis Ababa')
      .openPopup();
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
          </div>

          <!-- Code Panel: Flutter -->
          <div id="code-flutter" class="code-snippet-panel">
            <pre class="code-block">// 1. Add flutter_map to pubspec.yaml
// dependencies:
//   flutter_map: ^6.0.0
//   latlong2: ^0.9.0

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class EthiopiaMapPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        initialCenter: LatLng(9.0105, 38.7612),
        initialZoom: 13.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://open-ethiopia-map-isf6.vercel.app/api/v1/map/tiles/dark/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.ethiopiamap',
        ),
        MarkerLayer(
          markers: [
            Marker(
              point: LatLng(8.9806, 38.7578),
              width: 40,
              height: 40,
              child: Icon(Icons.location_on, color: Colors.red),
            ),
          ],
        ),
      ],
    );
  }
}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: INTERACTIVE API EXPLORER -->
    <section id="tab-playground" class="tab-panel">
      <div class="grid-2">
        <div>
          <h2 class="card-title">⚡ Interactive API Endpoints</h2>
          <p class="card-desc">Execute requests directly against the live backend and inspect results.</p>

          <!-- GET /api/v1/map/tiles -->
          <div class="endpoint-card open" id="ep-tiles">
            <div class="endpoint-header" onclick="toggleEndpoint('ep-tiles')">
              <div class="endpoint-path">
                <span class="http-method http-get">GET</span>
                <span>/api/v1/map/tiles/:style/:z/:x/:y.png</span>
              </div>
              <span class="badge badge-cyan">Map Tiles</span>
            </div>
            <div class="endpoint-body">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Serves cached raster map tiles for web & mobile apps. Styles: <code>dark</code>, <code>light</code>, <code>voyager</code>, <code>osm</code>.</p>
              <div class="form-row">
                <div class="form-group">
                  <label>Style</label>
                  <select id="api_tile_style">
                    <option value="dark">dark</option>
                    <option value="voyager">voyager</option>
                    <option value="light">light</option>
                    <option value="osm">osm</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Sample Tile (Z / X / Y)</label>
                  <input type="text" id="api_tile_coords" value="13/4978/3889" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testMapTile()">🚀 Load Tile Preview</button>
            </div>
          </div>

          <!-- GET /api/v1/map/autocomplete -->
          <div class="endpoint-card" id="ep-autocomplete">
            <div class="endpoint-header" onclick="toggleEndpoint('ep-autocomplete')">
              <div class="endpoint-path">
                <span class="http-method http-get">GET</span>
                <span>/api/v1/map/autocomplete</span>
              </div>
              <span class="badge badge-primary">Search</span>
            </div>
            <div class="endpoint-body">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Multi-source autocomplete search across local database, saved places, recommendations, and Photon.</p>
              <div class="form-row">
                <div class="form-group">
                  <label>Query (q) *</label>
                  <input type="text" id="api_q" value="Bole" />
                </div>
                <div class="form-group">
                  <label>Limit (1-25)</label>
                  <input type="number" id="api_limit" value="8" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testAutocomplete()">🚀 Send Request</button>
            </div>
          </div>

          <!-- GET /api/v1/map/reverse-geocode -->
          <div class="endpoint-card" id="ep-reverse">
            <div class="endpoint-header" onclick="toggleEndpoint('ep-reverse')">
              <div class="endpoint-path">
                <span class="http-method http-get">GET</span>
                <span>/api/v1/map/reverse-geocode</span>
              </div>
              <span class="badge badge-emerald">Geocode</span>
            </div>
            <div class="endpoint-body">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Convert coordinates to structured Ethiopian address & nearest landmark.</p>
              <div class="form-row">
                <div class="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" id="api_rev_lat" value="9.0105" />
                </div>
                <div class="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" id="api_rev_lng" value="38.7612" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testReverseGeocode()">🚀 Send Request</button>
            </div>
          </div>

          <!-- POST /api/v1/map/route -->
          <div class="endpoint-card" id="ep-route">
            <div class="endpoint-header" onclick="toggleEndpoint('ep-route')">
              <div class="endpoint-path">
                <span class="http-method http-post">POST</span>
                <span>/api/v1/map/route</span>
              </div>
              <span class="badge badge-cyan">Routing</span>
            </div>
            <div class="endpoint-body">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Compute fastest route geometry and turn-by-turn navigation.</p>
              <div class="form-group">
                <label>Origin & Destination Presets</label>
                <div class="presets-container">
                  <span class="preset-chip" onclick="setRoutePresets(8.9806, 38.7578, 8.9774, 38.7993)">Meskel Sq ➔ Bole Airport</span>
                  <span class="preset-chip" onclick="setRoutePresets(9.0350, 38.7525, 9.0150, 38.7660)">Piassa ➔ Kazanchis</span>
                  <span class="preset-chip" onclick="setRoutePresets(9.0305, 38.7390, 8.9806, 38.7578)">Merkato ➔ Meskel Sq</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Origin (lat,lng)</label>
                  <input type="text" id="api_route_origin" value="8.9806,38.7578" />
                </div>
                <div class="form-group">
                  <label>Destination (lat,lng)</label>
                  <input type="text" id="api_route_dest" value="8.9774,38.7993" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testPlanRoute()">🚀 Send Request</button>
            </div>
          </div>

          <!-- GET /health -->
          <div class="endpoint-card" id="ep-health">
            <div class="endpoint-header" onclick="toggleEndpoint('ep-health')">
              <div class="endpoint-path">
                <span class="http-method http-get">GET</span>
                <span>/health</span>
              </div>
              <span class="badge badge-amber">Health</span>
            </div>
            <div class="endpoint-body">
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Live health & readiness probe of PostgreSQL, Redis, and OSRM providers.</p>
              <button class="btn btn-primary btn-sm" onclick="testHealth()">🚀 Check Health</button>
            </div>
          </div>
        </div>

        <!-- Response Console -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h2 class="card-title" style="margin-bottom: 0;">📟 Live Response Output</h2>
            <button class="btn btn-secondary btn-sm" onclick="copyResponse()">📋 Copy Output</button>
          </div>
          <div style="margin-bottom: 0.75rem; display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-dim);">
            <span>Status: <strong id="res-status" style="color: #fff;">-</strong></span>
            <span>Time: <strong id="res-time" style="color: #fff;">-</strong></span>
            <span>Size: <strong id="res-size" style="color: #fff;">-</strong></span>
          </div>
          <pre class="code-block" id="responseConsole">// Click "Send Request" on any endpoint to view live output</pre>
          <div id="tileImagePreview" style="margin-top: 1rem; display: none; text-align: center;">
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">Rendered PNG Tile Preview:</p>
            <img id="tileImg" src="" style="border: 2px solid var(--primary); border-radius: 8px; width: 256px; height: 256px;" />
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: INGEST & ENRICHMENT -->
    <section id="tab-ingest" class="tab-panel">
      <div class="grid-2">
        <!-- Ingest Form -->
        <div class="card">
          <h2 class="card-title">📥 Ingest Custom Location / POI</h2>
          <p class="card-desc">Import new places into the canonical PackMan map database.</p>

          <form id="ingestForm" onsubmit="handleIngestPlace(event)">
            <div class="form-group">
              <label>Place Name *</label>
              <input type="text" id="ing_name" placeholder="e.g. Zemen Bank Headquarters" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Latitude *</label>
                <input type="number" step="any" id="ing_lat" value="9.0155" required />
              </div>
              <div class="form-group">
                <label>Longitude *</label>
                <input type="number" step="any" id="ing_lng" value="38.7675" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <input type="text" id="ing_cat" value="finance" />
              </div>
              <div class="form-group">
                <label>City</label>
                <input type="text" id="ing_city" value="Addis Ababa" />
              </div>
            </div>
            <div class="form-group">
              <label>Location Type</label>
              <select id="ing_type">
                <option value="BANK">Bank</option>
                <option value="OFFICE_BUILDING">Office Building</option>
                <option value="SHOPPING_MALL">Shopping Mall</option>
                <option value="HOTEL">Hotel</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="LANDMARK">Landmark</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              📥 Ingest Location (POST /api/v1/map/locations/ingest)
            </button>
          </form>
        </div>

        <!-- Location Enrichment Form -->
        <div class="card">
          <h2 class="card-title">✨ Submit Delivery Location Enrichment</h2>
          <p class="card-desc">Save customer-refined delivery details, gate instructions, and accepted names.</p>

          <form id="enrichForm" onsubmit="handleEnrichPlace(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Final Accepted Name *</label>
                <input type="text" id="enr_name" placeholder="e.g. Friendship Business Center, 4th Floor" required />
              </div>
              <div class="form-group">
                <label>User ID</label>
                <input type="text" id="enr_userId" value="user-dev-01" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Latitude *</label>
                <input type="number" step="any" id="enr_lat" value="8.9915" required />
              </div>
              <div class="form-group">
                <label>Longitude *</label>
                <input type="number" step="any" id="enr_lng" value="38.7865" required />
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="enr_savePlace" checked />
                Also save to user's Saved Places
              </label>
            </div>
            <div class="form-group">
              <label>Saved Place Label (if saving)</label>
              <input type="text" id="enr_label" value="Friendship Mall Office" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              ✨ Save Enrichment (POST /api/v1/map/location-enrichment)
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- TAB 5: ARCHITECTURE & SPECS -->
    <section id="tab-architecture" class="tab-panel">
      <div class="card">
        <h2 class="card-title">🏛️ Architecture & Platform Specifications</h2>
        <p class="card-desc">Domain-Driven Design (DDD) with 4-Layer Architecture and Autonomous Fallback Engines.</p>
        
        <div class="grid-2">
          <div>
            <h3 style="color: #818cf8; font-size: 1rem; margin-bottom: 0.5rem;">Core Architecture Layers</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem;">
              <li style="padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #6366f1;">
                <strong>Domain Layer:</strong> Pure business entities (Place, Location, RouteSession, LocationConfidence, RankingEngine). Zero infra dependencies.
              </li>
              <li style="padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #10b981;">
                <strong>Application Layer:</strong> Use Cases orchestrating search ranking, OSRM route computation, reverse geocoding, and session lifecycle.
              </li>
              <li style="padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #06b6d4;">
                <strong>Infrastructure Layer:</strong> PostgreSQL Prisma Repository with pg adapter, Redis multi-tier cache, OSRM engine, and Photon geocoding.
              </li>
              <li style="padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #f59e0b;">
                <strong>Presentation Layer:</strong> RESTful Express endpoints, DTO schema validation with Zod, and structured JSON logs.
              </li>
            </ul>
          </div>

          <div>
            <h3 style="color: #34d399; font-size: 1rem; margin-bottom: 0.5rem;">Quick Client SDK Example (cURL / JS)</h3>
            <pre class="code-block">// 1. Autocomplete Search
fetch("/api/v1/map/autocomplete?q=Bole")
  .then(res => res.json())
  .then(data => console.log(data));

// 2. Reverse Geocode
fetch("/api/v1/map/reverse-geocode?lat=9.0105&lng=38.7612")
  .then(res => res.json())
  .then(data => console.log(data.data.address));

// 3. Plan Turn-by-Turn Route
fetch("/api/v1/map/route", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    origin: { lat: 8.9806, lng: 38.7578 },
    destination: { lat: 8.9774, lng: 38.7993 },
    profile: "driving",
    steps: true
  })
});</pre>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- Edit Place Modal -->
  <div class="modal-overlay" id="editModal">
    <div class="modal-content">
      <h2 class="card-title" style="margin-bottom: 1rem;">✏️ Edit Saved Place</h2>
      <form id="editPlaceForm" onsubmit="handleUpdatePlace(event)">
        <input type="hidden" id="edit_id" />
        <input type="hidden" id="edit_userId" />

        <div class="form-group">
          <label>Label</label>
          <input type="text" id="edit_label" required />
        </div>

        <div class="form-group">
          <label>Display Name</label>
          <input type="text" id="edit_name" />
        </div>

        <div class="form-group">
          <label>Address</label>
          <input type="text" id="edit_address" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Latitude</label>
            <input type="number" step="any" id="edit_lat" required />
          </div>
          <div class="form-group">
            <label>Longitude</label>
            <input type="number" step="any" id="edit_lng" required />
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update Place</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast">
    <span id="toast-icon">ℹ️</span>
    <span id="toast-message">Message</span>
  </div>

  <!-- Client JavaScript -->
  <script>
    let currentSavedPlaces = [];
    let leafletMap = null;
    let currentTileLayer = null;
    let currentRouteLine = null;
    let mapMarkers = [];

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');

      if (tabId === 'tab-tiles' && leafletMap) {
        setTimeout(() => leafletMap.invalidateSize(), 200);
      }
    }

    function switchCodeTab(panelId) {
      document.querySelectorAll('.code-snippet-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.code-tab-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById(panelId);
      if (target) target.classList.add('active');

      const activeBtn = Array.from(document.querySelectorAll('.code-tab-btn')).find(btn => btn.getAttribute('onclick').includes(panelId));
      if (activeBtn) activeBtn.classList.add('active');
    }

    // Toggle Endpoint Card
    function toggleEndpoint(cardId) {
      const card = document.getElementById(cardId);
      if (card) card.classList.toggle('open');
    }

    // Toast Notification
    function showToast(msg, isSuccess = true) {
      const toast = document.getElementById('toast');
      const msgEl = document.getElementById('toast-message');
      const iconEl = document.getElementById('toast-icon');
      
      iconEl.textContent = isSuccess ? '✅' : '⚠️';
      msgEl.textContent = msg;
      toast.style.borderLeftColor = isSuccess ? '#10b981' : '#f43f5e';
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }

    // Initialize Leaflet Map
    function initLeafletMap() {
      if (leafletMap) return;
      
      leafletMap = L.map('liveLeafletMap').setView([9.0105, 38.7612], 13);
      setTileLayerStyle('dark');

      const meskelMarker = L.marker([8.9806, 38.7578]).addTo(leafletMap)
        .bindPopup('<b>Meskel Square</b><br>Addis Ababa, Ethiopia');
      mapMarkers.push(meskelMarker);

      leafletMap.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        showToast(\`Coordinates: \${lat.toFixed(4)}, \${lng.toFixed(4)}\`);

        const clickMarker = L.marker([lat, lng]).addTo(leafletMap);
        mapMarkers.push(clickMarker);

        try {
          const res = await fetch(\`/api/v1/map/reverse-geocode?lat=\${lat}&lng=\${lng}\`);
          const data = await res.json();
          const addr = data.data?.address?.formatted || 'Custom Location';
          clickMarker.bindPopup(\`<b>\${addr}</b><br>Lat: \${lat.toFixed(4)}, Lng: \${lng.toFixed(4)}\`).openPopup();
        } catch {
          clickMarker.bindPopup(\`Lat: \${lat.toFixed(4)}, Lng: \${lng.toFixed(4)}\`).openPopup();
        }
      });
    }

    function setTileLayerStyle(style) {
      if (!leafletMap) return;
      if (currentTileLayer) {
        leafletMap.removeLayer(currentTileLayer);
      }
      const tileUrl = \`/api/v1/map/tiles/\${style}/{z}/{x}/{y}.png\`;
      currentTileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; Open Ethiopia Map'
      }).addTo(leafletMap);
      showToast(\`Switched map layer to "\${style}" style\`);
    }

    async function drawDemoRoute() {
      if (!leafletMap) return;
      showToast('Calculating route from Meskel Square to Bole Airport...');

      try {
        const res = await fetch('/api/v1/map/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: { lat: 8.9806, lng: 38.7578 },
            destination: { lat: 8.9774, lng: 38.7993 },
            profile: 'driving',
            steps: true
          })
        });
        const data = await res.json();
        if (data.success && data.data?.routes?.[0]?.geometry?.coordinates) {
          const rawCoords = data.data.routes[0].geometry.coordinates;
          const latLngs = rawCoords.map(c => [c[1], c[0]]);

          if (currentRouteLine) leafletMap.removeLayer(currentRouteLine);

          currentRouteLine = L.polyline(latLngs, {
            color: '#6366f1',
            weight: 5,
            opacity: 0.9,
            dashArray: '1, 6'
          }).addTo(leafletMap);

          L.marker([8.9774, 38.7993]).addTo(leafletMap).bindPopup('<b>Bole International Airport</b>');

          leafletMap.fitBounds(currentRouteLine.getBounds(), { padding: [40, 40] });
          showToast(\`Route calculated: \${data.data.routes[0].summary.distanceText} (\${data.data.routes[0].summary.durationText})\`);
        }
      } catch (err) {
        showToast('Route calculation failed: ' + err.message, false);
      }
    }

    function testMapTile() {
      const style = document.getElementById('api_tile_style').value;
      const coords = document.getElementById('api_tile_coords').value.trim();
      const tileUrl = \`/api/v1/map/tiles/\${style}/\${coords}.png\`;

      document.getElementById('tileImagePreview').style.display = 'block';
      document.getElementById('tileImg').src = tileUrl;
      displayResponse(200, 15, \`// Loaded map tile image from \${tileUrl}\`);
      showToast(\`Tile loaded: \${tileUrl}\`);
    }

    // Set Form Coordinates Helper
    function setFormCoords(lat, lng, name, address) {
      document.getElementById('f_lat').value = lat;
      document.getElementById('f_lng').value = lng;
      if (name) document.getElementById('f_name').value = name;
      if (address) document.getElementById('f_address').value = address;
    }

    function setRoutePresets(lat1, lng1, lat2, lng2) {
      document.getElementById('api_route_origin').value = \`\${lat1},\${lng1}\`;
      document.getElementById('api_route_dest').value = \`\${lat2},\${lng2}\`;
    }

    // System Health Check
    async function checkSystemHealth() {
      const badge = document.getElementById('system-health-badge');
      const text = document.getElementById('health-text');
      try {
        const res = await fetch('/health');
        const data = await res.json();
        if (data.status === 'healthy') {
          text.textContent = 'System Operational • v' + (data.version || '1.0.0');
          badge.style.color = '#34d399';
        } else {
          text.textContent = 'System Degraded';
          badge.style.color = '#fbbf24';
        }
      } catch (err) {
        text.textContent = 'Service Offline';
        badge.style.color = '#fb7185';
      }
    }

    // Load Saved Places
    async function loadSavedPlaces() {
      const userId = document.getElementById('filter_userId').value || 'user-dev-01';
      const tbody = document.getElementById('placesTableBody');
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Fetching places from database...</td></tr>';

      try {
        const res = await fetch(\`/api/v1/map/saved-places?userId=\${encodeURIComponent(userId)}\`);
        const result = await res.json();

        if (!result.success || !result.data || !result.data.places) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No saved places found for this user.</td></tr>';
          return;
        }

        currentSavedPlaces = result.data.places;

        if (currentSavedPlaces.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No saved places found. Create your first place using the form!</td></tr>';
          return;
        }

        tbody.innerHTML = currentSavedPlaces.map(p => \`
          <tr>
            <td>
              <div style="font-weight: 600; color: #fff;">\${escapeHtml(p.label || 'Unnamed')}</div>
              <div style="font-size: 0.775rem; color: var(--text-muted);">\${escapeHtml(p.name || p.address || 'No address')}</div>
            </td>
            <td>
              <span class="badge badge-primary">\${escapeHtml(p.locationType || 'OTHER')}</span>
            </td>
            <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">
              \${Number(p.latitude).toFixed(4)}, \${Number(p.longitude).toFixed(4)}
            </td>
            <td>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal('\${p.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="handleDeletePlace('\${p.id}', '\${p.userId}')">🗑️ Delete</button>
              </div>
            </td>
          </tr>
        \`).join('');
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="4" style="text-align: center; color: #fb7185; padding: 1.5rem;">Failed to load saved places: \${err.message}</td></tr>\`;
      }
    }

    // Create Place
    async function handleCreatePlace(e) {
      e.preventDefault();
      const payload = {
        userId: document.getElementById('f_userId').value.trim(),
        label: document.getElementById('f_label').value.trim(),
        name: document.getElementById('f_name').value.trim() || undefined,
        address: document.getElementById('f_address').value.trim() || undefined,
        city: document.getElementById('f_city').value.trim() || undefined,
        locationType: document.getElementById('f_locationType').value,
        latitude: parseFloat(document.getElementById('f_lat').value),
        longitude: parseFloat(document.getElementById('f_lng').value),
        isDefault: document.getElementById('f_isDefault').checked,
      };

      try {
        const res = await fetch('/api/v1/map/saved-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
          showToast(\`Saved place "\${payload.label}" created successfully!\`);
          document.getElementById('filter_userId').value = payload.userId;
          document.getElementById('f_label').value = '';
          document.getElementById('f_name').value = '';
          document.getElementById('f_address').value = '';
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Failed to save place', false);
        }
      } catch (err) {
        showToast(err.message, false);
      }
    }

    // Edit Modal Functions
    function openEditModal(placeId) {
      const place = currentSavedPlaces.find(p => p.id === placeId);
      if (!place) return;

      document.getElementById('edit_id').value = place.id;
      document.getElementById('edit_userId').value = place.userId;
      document.getElementById('edit_label').value = place.label || '';
      document.getElementById('edit_name').value = place.name || '';
      document.getElementById('edit_address').value = place.address || '';
      document.getElementById('edit_lat').value = place.latitude;
      document.getElementById('edit_lng').value = place.longitude;

      document.getElementById('editModal').classList.add('open');
    }

    function closeEditModal() {
      document.getElementById('editModal').classList.remove('open');
    }

    async function handleUpdatePlace(e) {
      e.preventDefault();
      const id = document.getElementById('edit_id').value;
      const userId = document.getElementById('edit_userId').value;
      const payload = {
        userId,
        label: document.getElementById('edit_label').value.trim(),
        name: document.getElementById('edit_name').value.trim(),
        address: document.getElementById('edit_address').value.trim(),
        latitude: parseFloat(document.getElementById('edit_lat').value),
        longitude: parseFloat(document.getElementById('edit_lng').value),
      };

      try {
        const res = await fetch(\`/api/v1/map/saved-places/\${id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          showToast('Saved place updated successfully!');
          closeEditModal();
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Update failed', false);
        }
      } catch (err) {
        showToast(err.message, false);
      }
    }

    // Delete Place
    async function handleDeletePlace(placeId, userId) {
      if (!confirm('Are you sure you want to delete this saved place?')) return;

      try {
        const res = await fetch(\`/api/v1/map/saved-places/\${placeId}?userId=\${encodeURIComponent(userId)}\`, {
          method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
          showToast('Place deleted successfully');
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Delete failed', false);
        }
      } catch (err) {
        showToast(err.message, false);
      }
    }

    // Ingest Place
    async function handleIngestPlace(e) {
      e.preventDefault();
      const payload = {
        places: [{
          name: document.getElementById('ing_name').value.trim(),
          latitude: parseFloat(document.getElementById('ing_lat').value),
          longitude: parseFloat(document.getElementById('ing_lng').value),
          category: document.getElementById('ing_cat').value.trim(),
          city: document.getElementById('ing_city').value.trim(),
          locationType: document.getElementById('ing_type').value,
          source: "MANUAL"
        }]
      };

      try {
        const res = await fetch('/api/v1/map/locations/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        showToast('Place ingested into PackMan database!');
        switchTab('tab-playground');
        displayResponse(res.status, 200, JSON.stringify(data, null, 2));
      } catch (err) {
        showToast(err.message, false);
      }
    }

    // Location Enrichment
    async function handleEnrichPlace(e) {
      e.preventDefault();
      const payload = {
        finalName: document.getElementById('enr_name').value.trim(),
        userId: document.getElementById('enr_userId').value.trim(),
        latitude: parseFloat(document.getElementById('enr_lat').value),
        longitude: parseFloat(document.getElementById('enr_lng').value),
        savePlace: document.getElementById('enr_savePlace').checked,
        savedLabel: document.getElementById('enr_label').value.trim(),
        isEdit: false
      };

      try {
        const res = await fetch('/api/v1/map/location-enrichment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        showToast('Enrichment saved & recommendation recorded!');
        loadSavedPlaces();
      } catch (err) {
        showToast(err.message, false);
      }
    }

    // API Playground Testers
    async function executeApiCall(url, options = {}) {
      const startTime = performance.now();
      const consoleEl = document.getElementById('responseConsole');
      consoleEl.textContent = '// Sending request to ' + url + ' ...';
      document.getElementById('tileImagePreview').style.display = 'none';

      try {
        const res = await fetch(url, options);
        const elapsed = Math.round(performance.now() - startTime);
        const text = await res.text();
        let formatted = text;
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch {}

        displayResponse(res.status, elapsed, formatted);
      } catch (err) {
        displayResponse('ERR', 0, '// Network Error: ' + err.message);
      }
    }

    function displayResponse(status, timeMs, content) {
      document.getElementById('res-status').textContent = status;
      document.getElementById('res-time').textContent = timeMs + ' ms';
      document.getElementById('res-size').textContent = (content.length / 1024).toFixed(2) + ' KB';
      document.getElementById('responseConsole').textContent = content;
    }

    function copyResponse() {
      const text = document.getElementById('responseConsole').textContent;
      navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    }

    function testAutocomplete() {
      const q = document.getElementById('api_q').value;
      const limit = document.getElementById('api_limit').value;
      executeApiCall(\`/api/v1/map/autocomplete?q=\${encodeURIComponent(q)}&limit=\${limit}\`);
    }

    function testReverseGeocode() {
      const lat = document.getElementById('api_rev_lat').value;
      const lng = document.getElementById('api_rev_lng').value;
      executeApiCall(\`/api/v1/map/reverse-geocode?lat=\${lat}&lng=\${lng}\`);
    }

    function testPlanRoute() {
      const originParts = document.getElementById('api_route_origin').value.split(',');
      const destParts = document.getElementById('api_route_dest').value.split(',');
      const payload = {
        origin: { lat: parseFloat(originParts[0].trim()), lng: parseFloat(originParts[1].trim()) },
        destination: { lat: parseFloat(destParts[0].trim()), lng: parseFloat(destParts[1].trim()) },
        profile: 'driving',
        steps: true
      };
      executeApiCall('/api/v1/map/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    function testHealth() {
      executeApiCall('/health');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Init on load
    window.addEventListener('DOMContentLoaded', () => {
      checkSystemHealth();
      loadSavedPlaces();
      initLeafletMap();
    });
  </script>
</body>
</html>`;
}
