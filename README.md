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
curl http://localhost:7860/api/v1/packman/map/health
```

---

## 📡 API Reference & Endpoints

Base URL: `http://localhost:7860/api/v1/packman/map`

### 1. Calculate Route & Distance
```http
GET /route?originLat=8.9806&originLng=38.7578&destLat=9.0108&destLng=38.7636
```
**Response:**
```json
{
  "distanceKm": 4.25,
  "durationMinutes": 11.4,
  "polyline": "_p~iF~ps|U_ulLnnqC_mqN...",
  "status": "OK"
}
```

### 2. Place Autocomplete
```http
GET /autocomplete?query=Bole&limit=5
```

### 3. Reverse Geocode (GPS $\rightarrow$ Address)
```http
GET /reverse?lat=9.0108&lng=38.7636
```

### 4. Nearby Places & Landmarks
```http
GET /nearby?lat=9.0108&lng=38.7636&radius=1000
```

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
