# 🇪🇹 Open Ethiopia Map & Routing Engine

An open-source, high-performance **Map, Routing, Directions & Geocoding Suite** built specifically for Ethiopia. 

This platform bundles the **OSRM C++ routing engine** with a **TypeScript Map & Places API**, providing turn-by-turn routing, polyline geometry, distance & ETA calculations, place autocomplete, reverse geocoding, and a directory of Ethiopian landmarks.

---

## 🚀 Features

- 🏎️ **High-Speed Routing & ETAs**: Sub-10ms route calculations using Multi-Level Dijkstra (MLD) on OpenStreetMap Ethiopia road network.
- 📍 **Place Autocomplete & Search**: Fast typeahead search with fuzzy matching for Addis Ababa and Ethiopian cities.
- 🔁 **Reverse Geocoding**: Turn GPS coordinates `(lat, lng)` into street and landmark names.
- ⭐ **Saved Places & History**: Manage user favorite places (*Home*, *Work*, custom bookmarks) and search history.
- ⚡ **Redis & PostgreSQL Caching**: Multi-tiered caching layer ensuring minimal latency on frequent routes.
- 🌐 **100% Standalone & Free to Deploy**: Runs anywhere Docker is supported (Hugging Face Spaces, Oracle Cloud, Render, VPS).

---

## 📦 Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │            Public Clients / Apps             │
                      │         (Pack-Man, Web Apps, cURL)           │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP / REST (Port 7860)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    Node.js Map Service (TypeScript / Express) │
                      │   - Autocomplete & Place Search              │
                      │   - Reverse Geocoding                        │
                      │   - User Saved Places & History              │
                      └──────────────┬───────────────────────────────┘
                                     │ Internal IPC (Port 5000)
                                     ▼
                      ┌──────────────────────────────────────────────┐
                      │     OSRM C++ Engine (ethiopia-latest.osrm)   │
                      │   - Turn-by-turn navigation paths            │
                      │   - Real-time distance (km) & ETA (mins)     │
                      └──────────────────────────────────────────────┘
```

---

## 🛠️ Free 1-Click Cloud Deployment

### Option 1: Hugging Face Spaces (100% Free • 16 GB RAM • No Credit Card)

1. Create a free account at [Hugging Face](https://huggingface.co).
2. Click **New Space** $\rightarrow$ Set Name to `ethiopia-map-server`.
3. Choose **Docker (Blank)** and select the **Free (2 vCPU, 16 GB RAM)** tier.
4. Push this repository to your Space git repository:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/ethiopia-map-server
   git push hf main
   ```
5. *(Optional)* Add a free **Supabase / Neon** PostgreSQL connection string in Space **Settings $\rightarrow$ Variables & Secrets** as `MAP_DATABASE_URL` to persist saved places.
6. Your live public API will be accessible at:
   `https://YOUR_USERNAME-ethiopia-map-server.hf.space`

---

### Option 2: Local Docker / Self-Hosted VPS

```bash
# 1. Clone or navigate to the directory
cd open-ethiopia-map

# 2. Copy the environment configuration
cp .env.example .env

# 3. Build and launch all services
docker compose up -d --build

# 4. Check service health
curl http://localhost:7860/health
# Or canonical path:
curl http://localhost:7860/api/v1/map/health
```

---

## 📡 API Reference & Endpoints

Base URL: `http://localhost:8084` (or configured `PORT`)
Authentication: Header `X-API-Key: <key>` or Query `?key=<key>` (Manage keys via Developer Portal at `/portal`).

### 1. Calculate Route & Turn-by-Turn Navigation
```http
POST /api/v1/map/route
Content-Type: application/json
X-API-Key: <YOUR_SERVICE_KEY>

{
  "origin": { "latitude": 9.0108, "longitude": 38.7615 },
  "destination": { "latitude": 8.9806, "longitude": 38.7578 },
  "profile": "driving",   // "driving" | "bajaj" | "cycling" | "walking" | "motorcycle" (aliases: "car", "bike", "foot")
  "lang": "am",           // "en" | "am" (Amharic turn-by-turn maneuvers)
  "steps": true
}
```
**Response:**
```json
{
  "distance": 4250,
  "duration": 684,
  "geometry": "GeoJSON line or encoded polyline",
  "instructions": [
    "በደብረ ዘይት መንገድ ቀጥታ ይቀጥሉ (1.2 km)",
    "ወደ ጎተራ ማዞሪያ በቀኝ ታጠፍ",
    "መድረሻዎ ደርሰዋል"
  ],
  "profile": "driving"
}
```

### 2. Distance Matrix API ($N \times M$ Durations & Distances)
```http
POST /api/v1/map/matrix
Content-Type: application/json
X-API-Key: <YOUR_SERVICE_KEY>

{
  "origins": [
    { "latitude": 9.0120, "longitude": 38.7600 },
    { "latitude": 9.0150, "longitude": 38.7700 }
  ],
  "destinations": [
    { "latitude": 9.0108, "longitude": 38.7615 }
  ],
  "profile": "bajaj"
}
```
**Response:**
```json
{
  "durations": [[180], [420]],
  "distances": [[1200], [2800]],
  "profile": "bajaj"
}
```

### 3. Production Dispatch API (Two-Stage Driver Filter)
```http
POST /api/v1/map/dispatch/nearby
Content-Type: application/json
X-API-Key: <YOUR_SERVICE_KEY>

{
  "pickup": { "latitude": 9.0108, "longitude": 38.7615 },
  "vehicleType": "bajaj",
  "deliveryId": "del_109283",
  "radiusKm": 5,
  "limit": 10
}
```
*Ranks candidate drivers by true Ethiopian road network duration (accounting for road surfaces, barriers, and rush-hour traffic) in $< 5\text{ ms}$.*

### 4. Map Matching / Snap-to-Roads API
```http
POST /api/v1/map/match
Content-Type: application/json
X-API-Key: <YOUR_SERVICE_KEY>

{
  "coordinates": [
    { "latitude": 9.0108, "longitude": 38.7615, "timestamp": 1711200000 },
    { "latitude": 9.0112, "longitude": 38.7620, "timestamp": 1711200005 }
  ],
  "profile": "driving"
}
```

### 5. Dynamic Fleet Speed Telemetry
```http
POST /api/v1/map/traffic/telemetry
Content-Type: application/json
X-API-Key: <YOUR_SERVICE_KEY>

{
  "driverId": "drv_4821",
  "latitude": 9.0108,
  "longitude": 38.7615,
  "speedKmh": 18.5,
  "heading": 92.0
}
```

### 6. Vector Tile Server (PMTiles)
```http
GET /api/v1/map/tiles/vector/{z}/{x}/{y}.pbf?key=<PUBLIC_KEY>
GET /api/v1/map/tiles/style.json?key=<PUBLIC_KEY>
```

### 7. Place Autocomplete & Reverse Geocoding
```http
GET /api/v1/map/autocomplete?q=Bole+Medhanialem&limit=5&key=<KEY>
GET /api/v1/map/reverse-geocode?lat=9.0108&lng=38.7615&key=<KEY>
```

---

## 🔐 Developer Portal & API Key Management

Access the embedded Web Developer Portal at:
`http://localhost:8084/portal`

- **Login Credentials**: `kirubelbewket@gmail.com` / `Pass@123`
- Create, inspect, roll, and revoke API keys (`service` vs `public`).
- Public keys are restricted to vector tile delivery and place search.
- Service keys allow high-frequency routing, dispatching, and telemetry ingestion.

---

## 🤝 How to Contribute

We welcome contributions from the Ethiopian tech community!

1. **Custom Vehicle Profiles**:
   - Add `.lua` profiles for **Bajaj** (3-wheelers avoiding highways) or **Motorbikes** in `/profiles`.
2. **Landmark Data**:
   - Add missing Ethiopian landmarks, condominiums, hospitals, and points of interest to `src/infrastructure/search-sources/`.
3. **Speed & Traffic Calibrations**:
   - Tune road speeds for cobblestone, gravel, and newly paved Addis Ababa avenues.

---

## 📄 License
MIT License. OpenStreetMap data is available under the Open Database License (ODbL).
