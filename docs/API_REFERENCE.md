# 🇪🇹 Open Ethiopia Map & Spatial Engine — API Reference Manual
> **Version**: 1.0.0 • **Protocol**: HTTP/1.1 REST • **Encoding**: UTF-8 • **Format**: JSON / Protobuf (Vector Tiles)  
> **Production Ports**: `8084` (Node.js API) • `5000` (Internal OSRM Engine) • `7860` (Standalone Container Port)  
> **Target Fleets**: Automobiles (`car`), Bajaj / Three-Wheelers (`bajaj`), Motorcycles (`bike`), Pedestrians (`foot`)

---

## 📑 Table of Contents

1. [Quickstart (30 Seconds)](#1-quickstart-30-seconds)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [API Endpoints Reference](#3-api-endpoints-reference)
   - [3.1 Point-to-Point Routing & Amharic Maneuvers](#31-point-to-point-routing--turn-by-turn-navigation)
   - [3.2 $N \times M$ Distance & Duration Matrix](#32-n--m-distance--duration-matrix)
   - [3.3 Production Dispatch Engine (Two-Stage Driver Filter)](#33-production-dispatch-engine)
   - [3.4 Snap-to-Roads / GPS Map-Matching](#34-snap-to-roads--gps-map-matching)
   - [3.5 Dynamic Fleet Telemetry Ingestion](#35-dynamic-fleet-telemetry-ingestion)
   - [3.6 Canonical Route Sessions (Audited Deliveries)](#36-canonical-route-sessions)
   - [3.7 Self-Hosted Vector Tiles & MapLibre Styles](#37-self-hosted-vector-tiles--maplibre-styles)
   - [3.8 Places Autocomplete, Reverse Geocoding & Nearby](#38-places-autocomplete-reverse-geocoding--nearby)
   - [3.9 Admin & API Key Management](#39-admin--api-key-management)
4. [Status Codes & Error Dictionary](#4-status-codes--error-dictionary)
5. [Client SDK Snippets (cURL, TypeScript, Flutter, React Native)](#5-client-sdk-snippets)
6. [Interactive API Playground & Developer Portal](#6-interactive-api-playground--developer-portal)

---

## 1. Quickstart (30 Seconds)

### Base URLs
* **Local Development**: `http://localhost:8084`
* **Docker Container Default**: `http://localhost:7860`
* **Production Cluster**: `https://api.map.yourdomain.et`

### Test Route Calculation with Default Key
```bash
curl -X POST "http://localhost:8084/api/v1/map/route" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_delivery_live_gondar_3b1c559812a4" \
  -d '{
    "origin": { "latitude": 9.0108, "longitude": 38.7615 },
    "destination": { "latitude": 8.9806, "longitude": 38.7578 },
    "profile": "car",
    "lang": "am",
    "steps": true
  }'
```

---

## 2. Authentication & Authorization

Every request (except `/health`, `/portal`, and `/playground`) requires a valid API key.

### Supplying the Key
You can pass the API key in any of the following three ways:
1. **Header (Recommended)**: `X-API-Key: sk_delivery_live_gondar_3b1c559812a4`
2. **Bearer Authorization**: `Authorization: Bearer sk_delivery_live_gondar_3b1c559812a4`
3. **Query Parameter (For MapLibre Tiles)**: `?key=pk_driver_live_44e9b277ac11`

### Key Scopes & Roles
| Role | Allowed Endpoints | Rate Limit | Target Use Case |
|---|---|---|---|
| `service` | Full access (`/route`, `/matrix`, `/dispatch/*`, `/match`, `/traffic/*`, `/routes/*`, etc.) | $600\text{ req/min}$ | Backend services (Pack-Man, Ride Backend) |
| `public` | Read-only vector tiles & search (`/tiles/*`, `/autocomplete`, `/reverse-geocode`, `/nearby`) | $1200\text{ req/min}$ | Mobile Driver App, Customer Web Map |
| `admin` | Full key management (`/api/v1/admin/*`, `/portal`) | $300\text{ req/min}$ | Developer & DevOps Portal |

### Pre-Seeded Production Keys
| Application | Role | Key |
|---|---|---|
| **Delivery Backend (Pack-Man)** | `service` | `sk_delivery_live_gondar_3b1c559812a4` |
| **Ride-Hailing Backend** | `service` | `sk_ride_live_addis_7f8a92bcde10` |
| **Mobile Driver App (MapLibre)** | `public` | `pk_driver_live_44e9b277ac11` |

---

## 3. API Endpoints Reference

### 3.1 Point-to-Point Routing & Turn-by-Turn Navigation

Calculates the optimal driving, bajaj, or pedestrian path across the Ethiopian road network. Automatically applies:
* **Road Surface Penalties**: Realistic speeds for cobblestone (*chigign*), gravel, and dirt.
* **Elevation Grade**: Slowdown factors on steep hills (e.g. Gondar Arada/Goha).
* **Congestion Multipliers**: Peak rush hour dampening for Gotera, Meskel Sq, and Megenagna.

* **Endpoint**: `POST /api/v1/map/route`
* **Access**: `service` or `public`

#### Request Headers:
```http
Content-Type: application/json
X-API-Key: sk_delivery_live_gondar_3b1c559812a4
```

#### Request Body Schema:
```json
{
  "origin": {
    "latitude": 9.0108,
    "longitude": 38.7615
  },
  "destination": {
    "latitude": 8.9806,
    "longitude": 38.7578
  },
  "profile": "bajaj",
  "lang": "am",
  "steps": true,
  "alternatives": false
}
```
* `profile`: `"car"` | `"bajaj"` | `"bike"` | `"foot"` (default: `"car"`).
* `lang`: `"en"` | `"am"` (default: `"en"`). When `"am"` is requested, turn-by-turn maneuvers are localized in Amharic.
* `steps`: `boolean` (default: `true`).

#### Success Response (`200 OK`):
```json
{
  "distance": 4250,
  "duration": 684,
  "geometry": "GeoJSON LineString or Encoded Polyline",
  "instructions": [
    "በደብረ ዘይት መንገድ ቀጥታ ይቀጥሉ (1.2 km)",
    "ወደ ጎተራ ማዞሪያ በቀኝ ታጠፍ",
    "መድረሻዎ ደርሰዋል"
  ],
  "profile": "bajaj",
  "confidenceScore": 0.95
}
```

---

### 3.2 $N \times M$ Distance & Duration Matrix

Computes travel times and driving distances between multiple origin points and multiple destination points in a single $< 15\text{ ms}$ call. Crucial for matching available couriers/drivers to customer orders.

* **Endpoint**: `POST /api/v1/map/matrix`
* **Access**: `service` only

#### Request Body Schema:
```json
{
  "origins": [
    { "latitude": 9.0120, "longitude": 38.7600 },
    { "latitude": 9.0150, "longitude": 38.7700 },
    { "latitude": 9.0200, "longitude": 38.7800 }
  ],
  "destinations": [
    { "latitude": 9.0108, "longitude": 38.7615 }
  ],
  "profile": "car",
  "annotations": ["duration", "distance"]
}
```

#### Success Response (`200 OK`):
```json
{
  "durations": [
    [185],
    [340],
    [520]
  ],
  "distances": [
    [1250],
    [2400],
    [3900]
  ],
  "profile": "car",
  "sources": [
    { "latitude": 9.0120, "longitude": 38.7600 },
    { "latitude": 9.0150, "longitude": 38.7700 },
    { "latitude": 9.0200, "longitude": 38.7800 }
  ],
  "destinations": [
    { "latitude": 9.0108, "longitude": 38.7615 }
  ]
}
```
*Note: `durations` are in seconds, `distances` are in meters.*

---

### 3.3 Production Dispatch Engine

High-performance two-stage dispatch filter. Discovers candidate drivers (or accepts an explicit candidate list), filters out excluded/declined driver IDs, and ranks candidates by **true road network driving duration (ETA)**.

* **Endpoint**: `POST /api/v1/map/dispatch/nearby`
* **Access**: `service` only

#### Request Body Schema (Stateless Candidate Ranking):
```json
{
  "pickup": {
    "latitude": 9.0108,
    "longitude": 38.7615
  },
  "vehicleType": "bajaj",
  "deliveryId": "del_109283",
  "radiusKm": 5.0,
  "limit": 10,
  "candidates": [
    {
      "driverId": "drv_01",
      "latitude": 9.0130,
      "longitude": 38.7615,
      "vehicleType": "BAJAJ"
    },
    {
      "driverId": "drv_02",
      "latitude": 9.0180,
      "longitude": 38.7615,
      "vehicleType": "BAJAJ"
    }
  ]
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "pickup": { "latitude": 9.0108, "longitude": 38.7615 },
  "requestedVehicleType": "bajaj",
  "count": 2,
  "candidates": [
    {
      "driverId": "drv_01",
      "vehicleType": "BAJAJ",
      "coordinates": { "latitude": 9.0130, "longitude": 38.7615 },
      "straightDistanceMeters": 245,
      "roadDistanceMeters": 320,
      "roadDurationSeconds": 58,
      "etaMinutes": 1.0
    },
    {
      "driverId": "drv_02",
      "vehicleType": "BAJAJ",
      "coordinates": { "latitude": 9.0180, "longitude": 38.7615 },
      "straightDistanceMeters": 801,
      "roadDistanceMeters": 1080,
      "roadDurationSeconds": 194,
      "etaMinutes": 3.2
    }
  ]
}
```

---

### 3.4 Snap-to-Roads / GPS Map-Matching

Snaps noisy, raw GPS breadcrumb coordinates (recorded every 3–5 seconds from mobile apps) onto the true OpenStreetMap road centerline and calculates smoothed bearings.

* **Endpoint**: `POST /api/v1/map/match`
* **Access**: `service` or `public`

#### Request Body Schema:
```json
{
  "coordinates": [
    { "latitude": 9.0108, "longitude": 38.7615, "timestamp": 1711200000 },
    { "latitude": 9.0112, "longitude": 38.7620, "timestamp": 1711200005 },
    { "latitude": 9.0118, "longitude": 38.7625, "timestamp": 1711200010 }
  ],
  "profile": "car"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "confidence": 0.94,
  "matchedPoints": [
    { "latitude": 9.010812, "longitude": 38.761498, "bearing": 45 },
    { "latitude": 9.011195, "longitude": 38.762002, "bearing": 48 },
    { "latitude": 9.011789, "longitude": 38.762491, "bearing": 50 }
  ],
  "geometry": "LineString geometry"
}
```

---

### 3.5 Dynamic Fleet Telemetry Ingestion

Allows active drivers to stream real-time speed and heading updates. Computes rolling traffic speed anomalies for road cells (~110m resolution) in Redis with a 10-minute sliding window.

* **Endpoint**: `POST /api/v1/map/traffic/telemetry`
* **Access**: `service` only

#### Request Body:
```json
{
  "driverId": "drv_eth_882",
  "latitude": 9.0108,
  "longitude": 38.7615,
  "speedKmh": 18.5,
  "heading": 85.0,
  "profile": "car"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "recorded": true,
  "cell": "cell:9.011:38.762",
  "speedKmh": 18.5
}
```

---

### 3.6 Canonical Route Sessions

Creates an immutable, versioned audit trail for a delivery ride from pickup to dropoff. Ensures the customer, courier, and backend share the exact same canonical path.

* `POST /api/v1/map/routes/create` — Create session for a delivery.
* `GET /api/v1/map/routes/session/:id` — Retrieve session details.
* `GET /api/v1/map/routes/delivery/:deliveryId` — Retrieve active session by delivery ID (cached in Redis with sliding TTL).
* `POST /api/v1/map/routes/session/:id/check-deviation` — Check if driver is $> 100\text{m}$ off-route.
* `POST /api/v1/map/routes/session/:id/replan` — Create immutable `RouteRevision v2`.
* `POST /api/v1/map/routes/session/:id/close` — Mark delivery `"completed"` or `"cancelled"`.
* `GET /api/v1/map/routes/session/:id/history` — Audit trail of all route revisions.

#### Example: Check Deviation
```bash
curl -X POST "http://localhost:8084/api/v1/map/routes/session/sess_99812/check-deviation" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_delivery_live_gondar_3b1c559812a4" \
  -d '{
    "latitude": 9.0145,
    "longitude": 38.7690
  }'
```
**Response:**
```json
{
  "isDeviated": true,
  "deviationMeters": 142.5,
  "thresholdMeters": 100,
  "message": "Driver is 142.5m off planned route corridor"
}
```

---

### 3.7 Self-Hosted Vector Tiles & MapLibre Styles

Vector tiles are extracted from `ethiopia.pmtiles` on-the-fly using HTTP range reading.

* **Vector Tile URL**: `GET /api/v1/map/tiles/vector/{z}/{x}/{y}.pbf?key=<PUBLIC_KEY>`
* **MapLibre Style JSON**: `GET /api/v1/map/tiles/style.json?key=<PUBLIC_KEY>`

---

### 3.8 Places Autocomplete, Reverse Geocoding & Nearby

* **Autocomplete Search**:
  ```http
  GET /api/v1/map/autocomplete?q=Bole+Medhanialem&limit=5&key=<KEY>
  ```
* **Reverse Geocode (Lat/Lng $\rightarrow$ Street Address)**:
  ```http
  GET /api/v1/map/reverse-geocode?lat=9.0108&lng=38.7615&key=<KEY>
  ```
* **Nearby POI Search**:
  ```http
  GET /api/v1/map/nearby?lat=9.0108&lng=38.7615&radius=1000&category=fuel&key=<KEY>
  ```

---

### 3.9 Admin & API Key Management

* **Embedded Web Portal**: `http://localhost:8084/portal`
* **Admin Login**: `POST /api/v1/admin/auth/login` (`email: "kirubelbewket@gmail.com"`, `password: "Pass@123"`)
* **List Keys**: `GET /api/v1/admin/keys` (Bearer token)
* **Create Key**: `POST /api/v1/admin/keys`
* **Revoke Key**: `DELETE /api/v1/admin/keys/:id`

---

## 4. Status Codes & Error Dictionary

All errors follow standard RFC 7807 structured JSON payloads:
```json
{
  "error": "Error Title",
  "message": "Detailed explanation of the issue",
  "details": []
}
```

| HTTP Status | Reason | How to Resolve |
|---|---|---|
| `400 Bad Request` | Missing or invalid coordinates, unsupported profile | Check request JSON against Zod schema |
| `401 Unauthorized` | Missing, deactivated, or invalid API key | Pass valid `X-API-Key` or `Authorization: Bearer` |
| `403 Forbidden` | `public` key attempting to access `service` endpoint | Use a `service` role key from the Developer Portal |
| `404 Not Found` | Route session or location ID not found in database | Verify ID or query `/api/v1/map/routes/delivery/:id` |
| `429 Too Many Requests`| Exceeded per-minute rate limit ($600 - 1200\text{ req/min}$) | Implement client backoff or increase limit in Portal |
| `500 Server Error` | OSRM engine unreachable or internal exception | Verify OSRM process is running on port 5000 |

---

## 5. Client SDK Snippets

### Flutter SDK (Ride-Hailing & Driver App)
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> calculateRoute({
  required double originLat,
  required double originLng,
  required double destLat,
  required double destLng,
  String profile = 'car',
  String lang = 'am',
}) async {
  final url = Uri.parse('http://localhost:8084/api/v1/map/route');
  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'sk_ride_live_addis_7f8a92bcde10',
    },
    body: jsonEncode({
      'origin': {'latitude': originLat, 'longitude': originLng},
      'destination': {'latitude': destLat, 'longitude': destLng},
      'profile': profile,
      'lang': lang,
      'steps': true,
    }),
  );

  return jsonDecode(response.body);
}
```

### TypeScript / Node.js SDK (Pack-Man Backend)
```typescript
export async function getRoadEta(
  pickupLat: number,
  pickupLng: number,
  driverLat: number,
  driverLng: number,
  vehicleType: "bajaj" | "car" = "bajaj"
): Promise<{ etaMinutes: number; roadMeters: number }> {
  const res = await fetch("http://localhost:8084/api/v1/map/matrix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.MAP_SERVICE_KEY || "sk_delivery_live_gondar_3b1c559812a4",
    },
    body: JSON.stringify({
      origins: [{ latitude: driverLat, longitude: driverLng }],
      destinations: [{ latitude: pickupLat, longitude: pickupLng }],
      profile: vehicleType,
    }),
  });

  const data = await res.json();
  const durationSec = data.durations[0][0] ?? 0;
  const distanceMeters = data.distances[0][0] ?? 0;

  return {
    etaMinutes: Math.round((durationSec / 60) * 10) / 10,
    roadMeters: distanceMeters,
  };
}
```

---

## 6. Interactive API Playground & Developer Portal

Developers can test all endpoints in real time without writing any code:
* **Web Portal (Next.js)**: `http://localhost:3000/playground` & `http://localhost:3000/portal`
* **Microservice Embedded Portal**: `http://localhost:8084/playground` & `http://localhost:8084/portal`
* **Default Admin Login**:
  * **Email**: `kirubelbewket@gmail.com`
  * **Password**: `Pass@123`
