export function renderDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Open Ethiopia Map — Open-Source Routing, Geocoding & Map Tile Platform</title>
  
  <!-- Primary SEO Meta Tags -->
  <meta name="title" content="Open Ethiopia Map — Open-Source Routing, Geocoding & Map Tile Platform" />
  <meta name="description" content="Open-source location intelligence and routing platform for Ethiopia. Fast turn-by-turn navigation, multi-source place autocomplete, reverse geocoding, and raster map tiles for web and mobile." />
  <meta name="keywords" content="Ethiopia map API, Addis Ababa routing, Open Ethiopia Map, Ethiopian map tiles, MapLibre Ethiopia map, reverse geocoding Ethiopia, OSRM Ethiopia, Leaflet Ethiopia map, Ethiopia GIS, open source map" />
  <meta name="author" content="Open Ethiopia Map Contributors" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://open-ethiopia-map-isf6.vercel.app/" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://open-ethiopia-map-isf6.vercel.app/" />
  <meta property="og:title" content="Open Ethiopia Map — Open-Source Routing, Geocoding & Map Tiles" />
  <meta property="og:description" content="High-performance mapping and routing platform for Ethiopia. Turn-by-turn directions, place search, reverse geocoding, and map tiles." />
  <meta property="og:site_name" content="Open Ethiopia Map" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://open-ethiopia-map-isf6.vercel.app/" />
  <meta property="twitter:title" content="Open Ethiopia Map — Routing & Location Intelligence" />
  <meta property="twitter:description" content="Open-source geospatial platform for Ethiopia with OSRM routing, reverse geocoding, and raster map tiles." />

  <!-- Schema.org JSON-LD structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    "name": "Open Ethiopia Map API",
    "description": "Open-source routing, reverse geocoding, place autocomplete, and map tile services for Ethiopia.",
    "url": "https://open-ethiopia-map-isf6.vercel.app/",
    "provider": {
      "@type": "Organization",
      "name": "Open Ethiopia Map Contributors",
      "url": "https://github.com/kira-kb/open-ethiopia-map"
    },
    "serviceType": "Geographic Information System (GIS) and Navigation",
    "termsOfService": "https://opensource.org/licenses/MIT",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-subtle: #172033;
      --border: #334155;
      --border-light: #475569;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-secondary: #cbd5e1;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --code-bg: #090e17;
      --radius: 6px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .brand-flag {
      font-size: 1.35rem;
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #fff;
    }

    .brand-version {
      font-size: 0.75rem;
      background: var(--border);
      color: var(--text-muted);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      margin-left: 0.35rem;
    }

    nav.tabs {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .tab-btn:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: #fff;
      background: #334155;
      border-color: var(--border-light);
    }

    .github-link {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.825rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius);
      background: var(--card-subtle);
      border: 1px solid var(--border);
      transition: all 0.15s ease;
    }

    .github-link:hover {
      color: #fff;
      border-color: var(--border-light);
      background: #334155;
    }

    main {
      max-width: 1240px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .card-heading {
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.35rem;
    }

    .card-description {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1.15rem;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Form controls */
    .form-group {
      margin-bottom: 0.9rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.3rem;
    }

    input, select, textarea {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--border);
      color: #fff;
      padding: 0.5rem 0.7rem;
      border-radius: var(--radius);
      font-family: inherit;
      font-size: 0.85rem;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.5rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: var(--radius);
      border: 1px solid transparent;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn-secondary {
      background: #334155;
      color: var(--text);
      border-color: var(--border-light);
    }

    .btn-secondary:hover {
      background: #475569;
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    .btn-sm {
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
    }

    .presets-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.35rem;
    }

    .preset-pill {
      font-size: 0.76rem;
      background: #334155;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .preset-pill:hover {
      color: #fff;
      border-color: var(--primary);
    }

    /* Tables */
    .table-box {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background: var(--card-subtle);
      padding: 0.65rem 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    /* Documentation Section */
    .doc-nav {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }

    .doc-nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.825rem;
      padding: 0.3rem 0.6rem;
      border-radius: var(--radius);
      cursor: pointer;
    }

    .doc-nav-link:hover, .doc-nav-link.active {
      color: #fff;
      background: #334155;
    }

    .api-endpoint-doc {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card-subtle);
      margin-bottom: 1.25rem;
      overflow: hidden;
    }

    .api-endpoint-header {
      padding: 0.85rem 1.15rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background: #1e293b;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .method-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }

    .method-get { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .method-post { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    .method-put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }

    .endpoint-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: #fff;
      margin-left: 0.5rem;
    }

    .api-endpoint-body {
      padding: 1.15rem;
    }

    .doc-subtitle {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 0.9rem;
      margin-bottom: 0.35rem;
    }

    /* Code blocks */
    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.85rem 0.95rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      line-height: 1.45;
      color: #e2e8f0;
      overflow-x: auto;
      max-height: 420px;
    }

    /* Map container */
    #liveMap {
      height: 420px;
      width: 100%;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      position: relative;
    }

    /* MapLibre Dark UI Overrides */
    .maplibregl-popup-content {
      background: var(--card-bg) !important;
      color: var(--text) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px !important;
      padding: 0.85rem 1rem !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
      font-family: inherit !important;
      font-size: 0.85rem !important;
    }
    .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: var(--border) !important; }
    .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: var(--border) !important; }
    .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: var(--border) !important; }
    .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: var(--border) !important; }
    .maplibregl-popup-close-button {
      color: var(--text-muted) !important;
      font-size: 1.1rem !important;
      padding: 4px 8px !important;
    }
    .maplibregl-popup-close-button:hover {
      color: var(--text) !important;
      background: transparent !important;
    }
    .maplibregl-ctrl-group {
      background: var(--card-bg) !important;
      border: 1px solid var(--border) !important;
      border-radius: 6px !important;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    }
    .maplibregl-ctrl-group button {
      border-bottom: 1px solid var(--border) !important;
      background-color: transparent !important;
    }
    .maplibregl-ctrl-group button:last-child {
      border-bottom: none !important;
    }
    .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
      filter: invert(0.85);
    }
    .maplibregl-ctrl-group button:hover {
      background-color: #334155 !important;
    }

    .subnav-tabs {
      display: flex;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .subnav-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-family: inherit;
      font-size: 0.825rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius);
      cursor: pointer;
    }

    .subnav-btn.active {
      color: #fff;
      background: #334155;
    }

    .subpanel {
      display: none;
    }

    .subpanel.active {
      display: block;
    }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: #1e293b;
      color: #fff;
      padding: 0.7rem 1.15rem;
      border-radius: var(--radius);
      border-left: 3px solid var(--primary);
      border-top: 1px solid var(--border);
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
      z-index: 2000;
    }

    #toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1500;
      padding: 1rem;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .modal-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.35rem;
      max-width: 480px;
      width: 100%;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand-wrap">
      <span class="brand-flag">🇪🇹</span>
      <span class="brand-title">Open Ethiopia Map</span>
      <span class="brand-version">v1.0.0</span>
    </div>

    <nav class="tabs">
      <button class="tab-btn active" onclick="switchMainTab('tab-documentation')">Documentation</button>
      <button class="tab-btn" onclick="switchMainTab('tab-crud')">Saved places</button>
      <button class="tab-btn" onclick="switchMainTab('tab-tiles')">Map tiles & SDKs</button>
      <button class="tab-btn" onclick="switchMainTab('tab-playground')">API explorer</button>
      <button class="tab-btn" onclick="switchMainTab('tab-architecture')">Architecture</button>
    </nav>

    <a href="https://github.com/kira-kb/open-ethiopia-map" target="_blank" rel="noopener noreferrer" class="github-link">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="display: block;"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      <span>GitHub</span>
    </a>
  </header>

  <main>

    <!-- TAB 1: DEVELOPER DOCUMENTATION -->
    <section id="tab-documentation" class="tab-content active">
      <div class="card">
        <h1 class="card-heading">Developer API reference</h1>
        <p class="card-description">
          Complete technical specification and reference guide for the Open Ethiopia Map, Geocoding, Tile, and Routing platform.
        </p>

        <div class="doc-nav">
          <a class="doc-nav-link active" href="#doc-routing">Routing</a>
          <a class="doc-nav-link" href="#doc-search">Autocomplete</a>
          <a class="doc-nav-link" href="#doc-geocoding">Reverse geocode</a>
          <a class="doc-nav-link" href="#doc-nearby">Nearby places</a>
          <a class="doc-nav-link" href="#doc-tiles">Map tiles</a>
          <a class="doc-nav-link" href="#doc-saved-places">Saved places</a>
          <a class="doc-nav-link" href="#doc-route-sessions">Route sessions</a>
          <a class="doc-nav-link" href="#doc-enrichment">Location enrichment</a>
          <a class="doc-nav-link" href="#doc-health">System health</a>
        </div>

        <!-- 1. POST /api/v1/map/route -->
        <div class="api-endpoint-doc" id="doc-routing">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-post">POST</span>
              <span class="endpoint-title">/api/v1/map/route</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Turn-by-turn road navigation & geometry</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Computes road navigation, distance, estimated travel duration, and GeoJSON LineString coordinates between points in Ethiopia. Supports driving, cycling, walking, and motorcycle profiles.
            </p>

            <div class="doc-subtitle">Request body schema</div>
            <div class="code-block">{
  "origin": { "lat": 8.9806, "lng": 38.7578 },
  "destination": { "lat": 8.9774, "lng": 38.7993 },
  "stops": [{ "lat": 9.0105, "lng": 38.7612 }], // Optional intermediate waypoints
  "profile": "driving", // "driving" | "cycling" | "walking" | "motorcycle"
  "steps": true, // Return turn-by-turn maneuvers
  "alternatives": 0 // 0 to 3 alternative paths
}</div>

            <div class="doc-subtitle">Success response (200 OK)</div>
            <div class="code-block">{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route_osrm_0",
        "summary": {
          "distance": { "value": 6546.7, "unit": "m" },
          "duration": { "value": 515.7, "unit": "s" },
          "distanceText": "6.5 km",
          "durationText": "9 min"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [[38.757688, 8.980449], [38.761151, 8.980608], [38.7993, 8.9774]]
        },
        "waypoints": [{ "index": 0, "lat": 8.980449, "lng": 38.757688 }, { "index": 1, "lat": 8.9774, "lng": 38.7993 }],
        "steps": [
          {
            "instruction": "Head northeast on Africa Avenue",
            "distance": { "value": 1762.8, "unit": "m" },
            "duration": { "value": 148.8, "unit": "s" },
            "type": "turn",
            "modifier": "right"
          }
        ],
        "provider": "osrm"
      }
    ]
  },
  "meta": {
    "cached": false,
    "processingTime": 214
  }
}</div>
          </div>
        </div>

        <!-- 2. GET /api/v1/map/autocomplete -->
        <div class="api-endpoint-doc" id="doc-search">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/autocomplete</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Multi-source place search & ranker</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Searches places across user saved addresses, verified landmarks, cached recommendations, and OpenStreetMap. Automatically deduplicates results and scores by spatial proximity.
            </p>

            <div class="doc-subtitle">Query parameters</div>
            <div class="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>q</code></td>
                    <td>string</td>
                    <td>Yes</td>
                    <td>Query text (e.g. <code>Bole</code>, <code>Edna Mall</code>, <code>Kazanchis</code>)</td>
                  </tr>
                  <tr>
                    <td><code>limit</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Result count limit (default: 8, max: 25)</td>
                  </tr>
                  <tr>
                    <td><code>lat</code>, <code>lng</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Proximity bias coordinates for localized ranking</td>
                  </tr>
                  <tr>
                    <td><code>userId</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>User id to include personal saved places in results</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="doc-subtitle">Success response (200 OK)</div>
            <div class="code-block">{
  "success": true,
  "data": {
    "places": [
      {
        "id": "loc_bole_medhanialem",
        "name": "Bole Medhanialem Mall",
        "address": "Cameroon St, Bole, Addis Ababa",
        "latitude": 8.9954,
        "longitude": 38.7881,
        "city": "Addis Ababa",
        "source": "PACKMAN",
        "confidence": 0.95
      }
    ]
  }
}</div>
          </div>
        </div>

        <!-- 3. GET /api/v1/map/reverse-geocode -->
        <div class="api-endpoint-doc" id="doc-geocoding">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/reverse-geocode</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Coordinates to address resolution</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Converts latitude and longitude coordinates into administrative boundaries (subcity, city, postal code) and identifies nearest landmarks.
            </p>

            <div class="doc-subtitle">Query parameters</div>
            <div class="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>lat</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Latitude coordinate (-90 to 90)</td>
                  </tr>
                  <tr>
                    <td><code>lng</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Longitude coordinate (-180 to 180)</td>
                  </tr>
                  <tr>
                    <td><code>radius</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Search radius in meters (default: 50)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="doc-subtitle">Success response (200 OK)</div>
            <div class="code-block">{
  "success": true,
  "data": {
    "address": {
      "subcity": "Kirkos",
      "city": "Addis Ababa",
      "region": "Addis Ababa",
      "country": "Ethiopia",
      "formatted": "Meskel Square, Kirkos, Addis Ababa, Ethiopia"
    },
    "nearbyPlaces": [{ "name": "Meskel Square" }]
  }
}</div>
          </div>
        </div>

        <!-- 4. GET /api/v1/map/nearby -->
        <div class="api-endpoint-doc" id="doc-nearby">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/nearby</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Radial landmark search</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Finds places, businesses, and landmarks within a specified radius around a coordinate center point using haversine calculation.
            </p>

            <div class="doc-subtitle">Query parameters</div>
            <div class="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>lat</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Center point latitude</td>
                  </tr>
                  <tr>
                    <td><code>lng</code></td>
                    <td>number</td>
                    <td>Yes</td>
                    <td>Center point longitude</td>
                  </tr>
                  <tr>
                    <td><code>radius</code></td>
                    <td>number</td>
                    <td>No</td>
                    <td>Search radius in meters (default: 500, max: 10000)</td>
                  </tr>
                  <tr>
                    <td><code>category</code></td>
                    <td>string</td>
                    <td>No</td>
                    <td>Filter by category (e.g. <code>SHOPPING_MALL</code>, <code>HOTEL</code>, <code>BANK</code>)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 5. GET /api/v1/map/styles/:style.json -->
        <div class="api-endpoint-doc" id="doc-styles">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/styles/:style.json</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">MapLibre Style Specification (v8)</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Returns a full MapLibre Style Specification v8 JSON ready to be passed directly into MapLibre GL JS, MapLibre Flutter, or React Native. Auto-detects the host/protocol and configures theme background colors to prevent white flash.
            </p>

            <div class="doc-subtitle">Path parameters</div>
            <div class="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Options</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>style</code></td>
                    <td><code>dark</code>, <code>voyager</code>, <code>light</code>, <code>osm</code></td>
                    <td>Map style theme (default: <code>dark</code>)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 6. GET /api/v1/map/tiles/:style/:z/:x/:y.png -->
        <div class="api-endpoint-doc" id="doc-tiles">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/tiles/:style/:z/:x/:y.png</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Cached raster map tiles</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Delivers 256x256 raster map tiles directly to web and mobile mapping clients (MapLibre GL, Leaflet, React Native Maps, Flutter Map). Includes browser caching headers.
            </p>

            <div class="doc-subtitle">Path parameters</div>
            <div class="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Options</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>style</code></td>
                    <td><code>dark</code>, <code>voyager</code>, <code>light</code>, <code>osm</code></td>
                    <td>Visual style theme (default: <code>dark</code>)</td>
                  </tr>
                  <tr>
                    <td><code>z</code></td>
                    <td>integer (0-19)</td>
                    <td>Zoom level</td>
                  </tr>
                  <tr>
                    <td><code>x</code>, <code>y</code></td>
                    <td>integer</td>
                    <td>Slippy map tile coordinates</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 6. Saved Places CRUD -->
        <div class="api-endpoint-doc" id="doc-saved-places">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-post">POST</span>
              <span class="method-badge method-get">GET</span>
              <span class="method-badge method-put">PUT</span>
              <span class="method-badge method-delete">DELETE</span>
              <span class="endpoint-title">/api/v1/map/saved-places</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">User location management</span>
          </div>
          <div class="api-endpoint-body">
            <div class="doc-subtitle">1. Create saved place (POST)</div>
            <div class="code-block">POST /api/v1/map/saved-places
Content-Type: application/json

{
  "userId": "user-123",
  "label": "Bole Office",
  "name": "PackMan Bole Hub, 2nd Floor",
  "address": "Cameroon St, Bole",
  "city": "Addis Ababa",
  "locationType": "OFFICE_BUILDING",
  "latitude": 8.9892,
  "longitude": 38.7885,
  "isDefault": false
}</div>

            <div class="doc-subtitle">2. List saved places (GET)</div>
            <div class="code-block">GET /api/v1/map/saved-places?userId=user-123</div>

            <div class="doc-subtitle">3. Update saved place (PUT)</div>
            <div class="code-block">PUT /api/v1/map/saved-places/:id
Content-Type: application/json

{
  "userId": "user-123",
  "label": "Updated Label",
  "name": "Updated Name",
  "latitude": 8.9892,
  "longitude": 38.7885
}</div>

            <div class="doc-subtitle">4. Delete saved place (DELETE)</div>
            <div class="code-block">DELETE /api/v1/map/saved-places/:id?userId=user-123</div>
          </div>
        </div>

        <!-- 7. Route Sessions -->
        <div class="api-endpoint-doc" id="doc-route-sessions">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-post">POST</span>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/api/v1/map/routes/create & session/:id</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Canonical route session authority</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Enforces a canonical route per delivery with revision audit trails, driver deviation tracking (>100m off route), and replanning protection.
            </p>

            <div class="doc-subtitle">Create session (POST /api/v1/map/routes/create)</div>
            <div class="code-block">{
  "deliveryId": "deliv-789",
  "origin": { "lat": 8.9806, "lng": 38.7578 },
  "destination": { "lat": 8.9774, "lng": 38.7993 },
  "profile": "driving"
}</div>

            <div class="doc-subtitle">Check deviation (POST /api/v1/map/routes/session/:id/check-deviation)</div>
            <div class="code-block">{
  "driverLocation": { "lat": 8.9820, "lng": 38.7590 }
}

// Response:
{
  "success": true,
  "data": {
    "isDeviated": false,
    "deviationDistanceMeters": 24.3,
    "thresholdMeters": 100
  }
}</div>
          </div>
        </div>

        <!-- 8. Location Enrichment -->
        <div class="api-endpoint-doc" id="doc-enrichment">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-post">POST</span>
              <span class="endpoint-title">/api/v1/map/location-enrichment</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Crowdsourced delivery metadata</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Saves crowdsourced delivery notes, building entrances, security gates, and floor details.
            </p>
            <div class="code-block">{
  "userId": "user-123",
  "suggestedName": "Kazanchis Commercial Center",
  "finalName": "Kazanchis Commercial Center, Gate 2",
  "locationType": "OFFICE_BUILDING",
  "extraDetails": {
    "gateCode": "4421",
    "floor": "4th Floor",
    "securityNotes": "Leave package at reception"
  },
  "coordinates": { "lat": 9.0150, "lng": 38.7660 },
  "savePlace": true
}</div>
          </div>
        </div>

        <!-- 9. Health -->
        <div class="api-endpoint-doc" id="doc-health">
          <div class="api-endpoint-header">
            <div>
              <span class="method-badge method-get">GET</span>
              <span class="endpoint-title">/health</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Diagnostics & system status</span>
          </div>
          <div class="api-endpoint-body">
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;">
              Returns current health of PostgreSQL database connection, Redis cache, and route providers.
            </p>
            <div class="code-block">{
  "status": "healthy",
  "timestamp": "2026-09-07T12:00:00.000Z",
  "database": "connected",
  "cache": "operational",
  "provider": "osrm"
}</div>
          </div>
        </div>

      </div>
    </section>

    <!-- TAB 2: SAVED PLACES -->
    <section id="tab-crud" class="tab-content">
      <div class="grid-layout">
        <!-- Form -->
        <div class="card">
          <h2 class="card-heading">Add saved place</h2>
          <p class="card-description">Persist customer or delivery locations to Neon PostgreSQL.</p>
          
          <form id="createPlaceForm" onsubmit="handleCreatePlace(event)">
            <div class="form-row">
              <div class="form-group">
                <label for="f_userId">User id *</label>
                <input type="text" id="f_userId" value="user-dev-01" required />
              </div>
              <div class="form-group">
                <label for="f_label">Label * (e.g. Home, Office, Branch)</label>
                <input type="text" id="f_label" placeholder="e.g. Bole Branch" required />
              </div>
            </div>

            <div class="form-group">
              <label for="f_name">Display name</label>
              <input type="text" id="f_name" placeholder="e.g. PackMan Bole Hub, 2nd Floor" />
            </div>

            <div class="form-group">
              <label for="f_address">Full address or landmark</label>
              <input type="text" id="f_address" placeholder="e.g. Cameroon St, next to Edna Mall, Bole" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="f_city">City</label>
                <input type="text" id="f_city" value="Addis Ababa" />
              </div>
              <div class="form-group">
                <label for="f_locationType">Location type</label>
                <select id="f_locationType">
                  <option value="OFFICE_BUILDING">Office building</option>
                  <option value="SHOPPING_MALL">Shopping mall</option>
                  <option value="CONDOMINIUM">Condominium</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BANK">Bank</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="HOUSE">House or villa</option>
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
              <label>Quick Addis Ababa presets</label>
              <div class="presets-wrap">
                <span class="preset-pill" onclick="setFormCoords(8.9806, 38.7578, 'Meskel Square', 'Meskel Square, Addis Ababa')">Meskel Square</span>
                <span class="preset-pill" onclick="setFormCoords(8.9774, 38.7993, 'Bole Int Airport', 'Bole International Airport')">Bole Airport</span>
                <span class="preset-pill" onclick="setFormCoords(9.0350, 38.7525, 'Piassa De Gaulle', 'Piassa, Arada')">Piassa</span>
                <span class="preset-pill" onclick="setFormCoords(9.0305, 38.7390, 'Merkato Grand Market', 'Addis Ketema, Merkato')">Merkato</span>
                <span class="preset-pill" onclick="setFormCoords(9.0150, 38.7660, 'Kazanchis Business Dist', 'Kazanchis, Kirkos')">Kazanchis</span>
                <span class="preset-pill" onclick="setFormCoords(9.0062, 38.8681, 'CMC Real Estate', 'CMC, Bole/Yeka')">CMC</span>
                <span class="preset-pill" onclick="setFormCoords(8.9950, 38.7320, 'Sarbet / AU', 'Sarbet, Kirkos')">Sarbet</span>
              </div>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
              <input type="checkbox" id="f_isDefault" style="width: auto;" />
              <label for="f_isDefault" style="margin-bottom: 0; cursor: pointer;">Set as default address for this user</label>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Save place (POST /api/v1/map/saved-places)
            </button>
          </form>
        </div>

        <!-- Directory Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h2 class="card-heading" style="margin-bottom: 0;">Saved places directory</h2>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Direct query from PostgreSQL</span>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="text" id="filter_userId" value="user-dev-01" placeholder="User ID" style="width: 130px; font-size: 0.8rem;" />
              <button class="btn btn-secondary btn-sm" onclick="loadSavedPlaces()">Refresh</button>
            </div>
          </div>

          <div class="table-box">
            <table>
              <thead>
                <tr>
                  <th>Label & name</th>
                  <th>Type</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="placesTableBody">
                <tr>
                  <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading places...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: MAP TILES & SDKS -->
    <section id="tab-tiles" class="tab-content">
      <div class="grid-layout">
        <!-- MapLibre GL Viewer -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h2 class="card-heading" style="margin-bottom: 0;">Live MapLibre GL viewer</h2>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Style URL: <code>/api/v1/map/styles/{style}.json</code> &bull; Tiles: <code>/api/v1/map/tiles/{style}/{z}/{x}/{y}.png</code></span>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-primary btn-sm" id="btn-style-dark" onclick="setTileStyle('dark')">Dark</button>
              <button class="btn btn-secondary btn-sm" id="btn-style-voyager" onclick="setTileStyle('voyager')">Street</button>
              <button class="btn btn-secondary btn-sm" id="btn-style-light" onclick="setTileStyle('light')">Light</button>
              <button class="btn btn-secondary btn-sm" id="btn-style-osm" onclick="setTileStyle('osm')">OSM</button>
            </div>
          </div>

          <div id="liveMap"></div>

          <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
            <span>Click anywhere on the map to inspect coordinates & reverse-geocode.</span>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm" onclick="clearMapLayers()">Clear layers</button>
              <button class="btn btn-primary btn-sm" onclick="drawDemoRoute()">Draw sample route</button>
            </div>
          </div>
        </div>

        <!-- Client Code Guides -->
        <div class="card">
          <h2 class="card-heading">Client integration guides</h2>
          <p class="card-description">Production-ready MapLibre code snippets for web and mobile (zero API keys required).</p>

          <div class="subnav-tabs">
            <button class="subnav-btn active" onclick="switchSubTab('sub-react')">React</button>
            <button class="subnav-btn" onclick="switchSubTab('sub-native')">React Native</button>
            <button class="subnav-btn" onclick="switchSubTab('sub-html')">Plain HTML</button>
            <button class="subnav-btn" onclick="switchSubTab('sub-flutter')">Flutter</button>
          </div>

          <div id="sub-react" class="subpanel active">
            <pre class="code-block">// npm install maplibre-gl
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function EthiopiaMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://open-ethiopia-map-isf6.vercel.app/api/v1/map/styles/dark.json",
      center: [38.7612, 9.0105], // [lng, lat]
      zoom: 12.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    new maplibregl.Marker({ color: "#10b981" })
      .setLngLat([38.7578, 8.9806])
      .setPopup(new maplibregl.Popup().setHTML("&lt;b&gt;Meskel Square&lt;/b&gt;&lt;br/&gt;Addis Ababa"))
      .addTo(map.current);

    return () => map.current?.remove();
  }, []);

  return &lt;div ref={mapContainer} style={{ width: "100%", height: "420px", borderRadius: "8px" }} /&gt;;
}</pre>
          </div>

          <div id="sub-native" class="subpanel">
            <pre class="code-block">// npm install @maplibre/maplibre-react-native
import React from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

MapLibreGL.setAccessToken(null); // No token needed!

export function MobileMap() {
  return (
    &lt;View style={styles.container}&gt;
      &lt;MapLibreGL.MapView
        style={styles.map}
        styleURL="https://open-ethiopia-map-isf6.vercel.app/api/v1/map/styles/dark.json"
        logoEnabled={false}
      &gt;
        &lt;MapLibreGL.Camera
          zoomLevel={12.5}
          centerCoordinate={[38.7612, 9.0105]}
          animationMode="flyTo"
        /&gt;
        &lt;MapLibreGL.PointAnnotation id="meskel" coordinate={[38.7578, 8.9806]}&gt;
          &lt;View style={styles.marker} /&gt;
        &lt;/MapLibreGL.PointAnnotation&gt;
      &lt;/MapLibreGL.MapView&gt;
    &lt;/View&gt;
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  marker: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#10b981", borderWidth: 2, borderColor: "#fff" },
});</pre>
          </div>

          <div id="sub-html" class="subpanel">
            <pre class="code-block">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;meta charset="utf-8" /&gt;
  &lt;title&gt;Open Ethiopia Map&lt;/title&gt;
  &lt;link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" /&gt;
  &lt;script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"&gt;&lt;/script&gt;
  &lt;style&gt;
    #map { height: 420px; width: 100%; border-radius: 8px; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div id="map"&gt;&lt;/div&gt;
  &lt;script&gt;
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://open-ethiopia-map-isf6.vercel.app/api/v1/map/styles/dark.json',
      center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
      zoom: 12.5
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    new maplibregl.Marker({ color: '#10b981' })
      .setLngLat([38.7578, 8.9806])
      .setPopup(new maplibregl.Popup().setText('Meskel Square, Addis Ababa'))
      .addTo(map);
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
          </div>

          <div id="sub-flutter" class="subpanel">
            <pre class="code-block">// pubspec.yaml: maplibre_gl: ^0.16.0
import 'package:flutter/material.dart';
import 'package:maplibre_gl/maplibre_gl.dart';

class EthiopiaMapPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: MapLibreMap(
        styleString: 'https://open-ethiopia-map-isf6.vercel.app/api/v1/map/styles/dark.json',
        initialCameraPosition: const CameraPosition(
          target: LatLng(9.0105, 38.7612),
          zoom: 12.5,
        ),
        onMapCreated: (controller) {
          controller.addCircle(const CircleOptions(
            geometry: LatLng(8.9806, 38.7578),
            circleColor: "#10b981",
            circleRadius: 8.0,
          ));
        },
      ),
    );
  }
}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: API EXPLORER -->
    <section id="tab-playground" class="tab-content">
      <div class="grid-layout">
        <div>
          <h2 class="card-heading">API explorer</h2>
          <p class="card-description">Send live requests directly to the API endpoints and view the output.</p>

          <!-- Autocomplete -->
          <div class="api-endpoint-doc">
            <div class="api-endpoint-header">
              <div>
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-title">/api/v1/map/autocomplete</span>
              </div>
            </div>
            <div class="api-endpoint-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Query (q)</label>
                  <input type="text" id="api_q" value="Bole" />
                </div>
                <div class="form-group">
                  <label>Limit</label>
                  <input type="number" id="api_limit" value="6" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testAutocomplete()">Send request</button>
            </div>
          </div>

          <!-- Reverse Geocode -->
          <div class="api-endpoint-doc">
            <div class="api-endpoint-header">
              <div>
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-title">/api/v1/map/reverse-geocode</span>
              </div>
            </div>
            <div class="api-endpoint-body">
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
              <button class="btn btn-primary btn-sm" onclick="testReverseGeocode()">Send request</button>
            </div>
          </div>

          <!-- Route Plan -->
          <div class="api-endpoint-doc">
            <div class="api-endpoint-header">
              <div>
                <span class="method-badge method-post">POST</span>
                <span class="endpoint-title">/api/v1/map/route</span>
              </div>
            </div>
            <div class="api-endpoint-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Origin (lat, lng)</label>
                  <input type="text" id="api_route_origin" value="8.9806, 38.7578" />
                </div>
                <div class="form-group">
                  <label>Destination (lat, lng)</label>
                  <input type="text" id="api_route_dest" value="8.9774, 38.7993" />
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="testPlanRoute()">Send request</button>
            </div>
          </div>

          <!-- Health -->
          <div class="api-endpoint-doc">
            <div class="api-endpoint-header">
              <div>
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-title">/health</span>
              </div>
            </div>
            <div class="api-endpoint-body">
              <button class="btn btn-primary btn-sm" onclick="testHealth()">Check health</button>
            </div>
          </div>
        </div>

        <!-- Response Console -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h2 class="card-heading" style="margin-bottom: 0;">Response console</h2>
            <button class="btn btn-secondary btn-sm" onclick="copyResponse()">Copy JSON</button>
          </div>
          <div style="margin-bottom: 0.75rem; display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
            <span>Status: <strong id="res-status" style="color: #fff;">-</strong></span>
            <span>Duration: <strong id="res-time" style="color: #fff;">-</strong></span>
            <span>Size: <strong id="res-size" style="color: #fff;">-</strong></span>
          </div>
          <pre class="code-block" id="responseConsole">// Select an endpoint and click Send request</pre>
        </div>
      </div>
    </section>

    <!-- TAB 5: ARCHITECTURE -->
    <section id="tab-architecture" class="tab-content">
      <div class="card">
        <h2 class="card-heading">Platform architecture</h2>
        <p class="card-description">Structured using Domain-Driven Design (DDD) across 4 distinct layers.</p>

        <div class="grid-layout">
          <div>
            <div class="doc-subtitle">Layer overview</div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
              <li style="padding: 0.75rem; background: var(--card-subtle); border-radius: var(--radius); border-left: 3px solid var(--primary);">
                <strong>Domain layer:</strong> Pure business entities (Place, Location, RouteSession, LocationConfidence). Zero external dependencies.
              </li>
              <li style="padding: 0.75rem; background: var(--card-subtle); border-radius: var(--radius); border-left: 3px solid var(--success);">
                <strong>Application layer:</strong> Use cases orchestrating multi-source ranking, OSRM road routing, and session lifecycle.
              </li>
              <li style="padding: 0.75rem; background: var(--card-subtle); border-radius: var(--radius); border-left: 3px solid var(--warning);">
                <strong>Infrastructure layer:</strong> PostgreSQL repository via Prisma pg adapter, Redis cache with non-blocking bypass, OSRM router, and Photon geocoding.
              </li>
              <li style="padding: 0.75rem; background: var(--card-subtle); border-radius: var(--radius); border-left: 3px solid var(--danger);">
                <strong>Presentation layer:</strong> Express REST routes, Zod input validation schemas, and structured logging.
              </li>
            </ul>
          </div>

          <div>
            <div class="doc-subtitle">Database models</div>
            <div class="code-block">// Core Tables in Neon PostgreSQL:
- RouteSession (Canonical delivery route state)
- RouteRevision (Immutable route replan history)
- SavedPlace (User saved addresses)
- Place (Denormalized landmarks with confidence scores)
- LocationEnrichment (Crowdsourced delivery metadata)
- LocationConfidence (Delivery outcome accuracy score)</div>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- Edit Modal -->
  <div class="modal-backdrop" id="editModal">
    <div class="modal-box">
      <h3 class="card-heading" style="margin-bottom: 1rem;">Edit saved place</h3>
      <form id="editPlaceForm" onsubmit="handleUpdatePlace(event)">
        <input type="hidden" id="edit_id" />
        <input type="hidden" id="edit_userId" />

        <div class="form-group">
          <label>Label</label>
          <input type="text" id="edit_label" required />
        </div>

        <div class="form-group">
          <label>Display name</label>
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

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.25rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeEditModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save changes</button>
        </div>
      </form>
    </div>
  </div>

  <div id="toast">
    <span id="toast-message">Message</span>
  </div>

  <script>
    let currentSavedPlaces = [];
    let maplibreMap = null;
    let activeMarkers = [];
    let activePopup = null;
    let currentStyleName = 'dark';

    function switchMainTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');

      if (tabId === 'tab-tiles' && maplibreMap) {
        setTimeout(() => maplibreMap.resize(), 150);
      }
    }

    function switchSubTab(panelId) {
      document.querySelectorAll('.subpanel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.subnav-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById(panelId);
      if (target) target.classList.add('active');

      const activeBtn = Array.from(document.querySelectorAll('.subnav-btn')).find(btn => btn.getAttribute('onclick').includes(panelId));
      if (activeBtn) activeBtn.classList.add('active');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-message').textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function initMap() {
      if (maplibreMap) return;

      maplibreMap = new maplibregl.Map({
        container: 'liveMap',
        style: '/api/v1/map/styles/dark.json',
        center: [38.7612, 9.0105], // Addis Ababa [lng, lat]
        zoom: 12.5,
      });

      maplibreMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      maplibreMap.addControl(new maplibregl.FullscreenControl(), 'top-right');

      maplibreMap.on('load', () => {
        addLandmarkMarker([38.7578, 8.9806], 'Meskel Square', 'Central Addis Ababa landmark', '#10b981');
      });

      maplibreMap.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        showToast('Coordinates: ' + lat.toFixed(4) + ', ' + lng.toFixed(4));

        if (activePopup) activePopup.remove();

        // Custom styled marker element
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#38bdf8';
        el.style.border = '2px solid #ffffff';
        el.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.8)';
        el.style.cursor = 'pointer';

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(maplibreMap);
        activeMarkers.push(marker);

        activePopup = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat([lng, lat])
          .setHTML(
            '<div style="min-width: 170px;">' +
            '<div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Inspecting point...</div>' +
            '<div style="color: var(--text-muted); font-size: 0.775rem;">Lat: ' + lat.toFixed(5) + '<br/>Lng: ' + lng.toFixed(5) + '</div>' +
            '</div>'
          )
          .addTo(maplibreMap);

        try {
          const res = await fetch('/api/v1/map/reverse-geocode?lat=' + lat + '&lng=' + lng);
          const data = await res.json();
          const addr = data.data?.address?.formatted || data.data?.displayName || 'Selected Location';
          const name = data.data?.name || '';
          const escapedName = name.replace(/'/g, "\\'");
          const escapedAddr = addr.replace(/'/g, "\\'");

          activePopup.setHTML(
            '<div style="min-width: 190px;">' +
            '<div style="font-weight: 600; font-size: 0.875rem; color: #38bdf8; margin-bottom: 0.25rem;">' + addr + '</div>' +
            '<div style="color: var(--text-muted); font-size: 0.775rem; margin-bottom: 0.5rem;">Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5) + '</div>' +
            '<button class="btn btn-secondary btn-sm" style="width: 100%; font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="setFormCoords(' + lat + ', ' + lng + ', \'' + escapedName + '\', \'' + escapedAddr + '\')">Use in Saved Places</button>' +
            '</div>'
          );
        } catch {
          // fallback already active
        }
      });
    }

    function addLandmarkMarker(coords, title, subtitle, color) {
      if (!maplibreMap) return;
      color = color || '#10b981';
      const marker = new maplibregl.Marker({ color: color })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            '<div style="min-width: 160px;">' +
            '<div style="font-weight: 600; font-size: 0.875rem; color: ' + color + ';">' + title + '</div>' +
            '<div style="color: var(--text-muted); font-size: 0.775rem;">' + subtitle + '</div>' +
            '</div>'
          )
        )
        .addTo(maplibreMap);
      activeMarkers.push(marker);
      return marker;
    }

    function setTileStyle(style) {
      if (!maplibreMap) return;
      currentStyleName = style;

      ['dark', 'voyager', 'light', 'osm'].forEach(s => {
        const btn = document.getElementById('btn-style-' + s);
        if (btn) {
          if (s === style) {
            btn.className = 'btn btn-primary btn-sm';
          } else {
            btn.className = 'btn btn-secondary btn-sm';
          }
        }
      });

      // Preserve any active demo route data
      const existingRouteData = maplibreMap.getSource('demo-route-src') ? maplibreMap.getSource('demo-route-src')._data : null;

      maplibreMap.setStyle('/api/v1/map/styles/' + style + '.json');

      maplibreMap.once('style.load', () => {
        if (existingRouteData) {
          addRouteLayers(existingRouteData);
        }
      });

      showToast('Switched to ' + style + ' map style');
    }

    function addRouteLayers(geojsonData) {
      if (!maplibreMap) return;
      if (maplibreMap.getSource('demo-route-src')) {
        maplibreMap.getSource('demo-route-src').setData(geojsonData);
        return;
      }

      maplibreMap.addSource('demo-route-src', {
        type: 'geojson',
        data: geojsonData,
      });

      maplibreMap.addLayer({
        id: 'demo-route-glow',
        type: 'line',
        source: 'demo-route-src',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0284c7',
          'line-width': 8,
          'line-opacity': 0.5,
        },
      });

      maplibreMap.addLayer({
        id: 'demo-route-core',
        type: 'line',
        source: 'demo-route-src',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
        },
      });
    }

    async function drawDemoRoute() {
      if (!maplibreMap) return;
      showToast('Calculating route...');
      try {
        const res = await fetch('/api/v1/map/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: { lat: 8.9806, lng: 38.7578 },
            destination: { lat: 8.9774, lng: 38.7993 },
            profile: 'driving',
            steps: true,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.routes?.[0]?.geometry?.coordinates) {
          const route = data.data.routes[0];
          const coords = route.geometry.coordinates; // [ [lng, lat], ... ]

          addRouteLayers({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords,
            },
          });

          addLandmarkMarker([38.7993, 8.9774], 'Bole International Airport', 'Destination', '#38bdf8');

          const bounds = coords.reduce(
            (b, coord) => b.extend(coord),
            new maplibregl.LngLatBounds(coords[0], coords[0]),
          );

          maplibreMap.fitBounds(bounds, { padding: 50, duration: 1000 });
          showToast('Route loaded: ' + route.summary.distanceText + ' (' + route.summary.durationText + ')');
        } else {
          showToast('No route found');
        }
      } catch (err) {
        showToast('Route calculation failed: ' + err.message);
      }
    }

    function clearMapLayers() {
      if (!maplibreMap) return;
      activeMarkers.forEach(m => m.remove());
      activeMarkers = [];
      if (activePopup) {
        activePopup.remove();
        activePopup = null;
      }
      if (maplibreMap.getLayer('demo-route-core')) maplibreMap.removeLayer('demo-route-core');
      if (maplibreMap.getLayer('demo-route-glow')) maplibreMap.removeLayer('demo-route-glow');
      if (maplibreMap.getSource('demo-route-src')) maplibreMap.removeSource('demo-route-src');

      addLandmarkMarker([38.7578, 8.9806], 'Meskel Square', 'Central Addis Ababa landmark', '#10b981');
      showToast('Cleared custom layers');
    }

    function setFormCoords(lat, lng, name, address) {
      document.getElementById('f_lat').value = lat;
      document.getElementById('f_lng').value = lng;
      if (name) document.getElementById('f_name').value = name;
      if (address) document.getElementById('f_address').value = address;
    }

    async function loadSavedPlaces() {
      const userId = document.getElementById('filter_userId').value || 'user-dev-01';
      const tbody = document.getElementById('placesTableBody');
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Fetching records...</td></tr>';

      try {
        const res = await fetch(\`/api/v1/map/saved-places?userId=\${encodeURIComponent(userId)}\`);
        const result = await res.json();

        if (!result.success || !result.data?.places?.length) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No saved places found for this user.</td></tr>';
          return;
        }

        currentSavedPlaces = result.data.places;
        tbody.innerHTML = currentSavedPlaces.map(p => \`
          <tr>
            <td>
              <div style="font-weight: 500; color: #fff;">\${escapeHtml(p.label || 'Unnamed')}</div>
              <div style="font-size: 0.775rem; color: var(--text-muted);">\${escapeHtml(p.name || p.address || '')}</div>
            </td>
            <td>\${escapeHtml(p.locationType || 'Other')}</td>
            <td style="font-family: monospace; font-size: 0.8rem;">\${Number(p.latitude).toFixed(4)}, \${Number(p.longitude).toFixed(4)}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="openEditModal('\${p.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="handleDeletePlace('\${p.id}', '\${p.userId}')">Delete</button>
            </td>
          </tr>
        \`).join('');
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="4" style="text-align: center; color: #f87171; padding: 1.5rem;">Failed to load places: \${err.message}</td></tr>\`;
      }
    }

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
          showToast('Saved place created');
          document.getElementById('f_label').value = '';
          document.getElementById('f_name').value = '';
          document.getElementById('f_address').value = '';
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Failed to save place');
        }
      } catch (err) {
        showToast(err.message);
      }
    }

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
          showToast('Saved place updated');
          closeEditModal();
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Update failed');
        }
      } catch (err) {
        showToast(err.message);
      }
    }

    async function handleDeletePlace(placeId, userId) {
      if (!confirm('Are you sure you want to delete this place?')) return;
      try {
        const res = await fetch(\`/api/v1/map/saved-places/\${placeId}?userId=\${encodeURIComponent(userId)}\`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          showToast('Place deleted');
          loadSavedPlaces();
        } else {
          showToast(data.error?.message || 'Delete failed');
        }
      } catch (err) {
        showToast(err.message);
      }
    }

    async function executeApiCall(url, options = {}) {
      const startTime = performance.now();
      const consoleEl = document.getElementById('responseConsole');
      consoleEl.textContent = '// Sending request to ' + url + ' ...';

      try {
        const res = await fetch(url, options);
        const elapsed = Math.round(performance.now() - startTime);
        const text = await res.text();
        let formatted = text;
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch {}

        document.getElementById('res-status').textContent = res.status;
        document.getElementById('res-time').textContent = elapsed + ' ms';
        document.getElementById('res-size').textContent = (formatted.length / 1024).toFixed(2) + ' KB';
        consoleEl.textContent = formatted;
      } catch (err) {
        consoleEl.textContent = '// Error: ' + err.message;
      }
    }

    function copyResponse() {
      navigator.clipboard.writeText(document.getElementById('responseConsole').textContent);
      showToast('Copied to clipboard');
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
      executeApiCall('/api/v1/map/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: parseFloat(originParts[0].trim()), lng: parseFloat(originParts[1].trim()) },
          destination: { lat: parseFloat(destParts[0].trim()), lng: parseFloat(destParts[1].trim()) },
          profile: 'driving',
          steps: true
        })
      });
    }

    function testHealth() {
      executeApiCall('/health');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.addEventListener('DOMContentLoaded', () => {
      loadSavedPlaces();
      initMap();
    });
  </script>
</body>
</html>`;
}
