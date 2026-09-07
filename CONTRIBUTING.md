# Contributing to Open Ethiopia Map & Routing Engine

Thank you for your interest in contributing to the **Open Ethiopia Map** project! 🇪🇹

Our goal is to provide Ethiopia with a resilient, open-source, and free mapping and navigation infrastructure.

---

## Ways to Contribute

### 1. Adding Ethiopian Points of Interest (POIs) & Landmarks
We maintain a directory of landmark locations across Addis Ababa and other Ethiopian regions (e.g. condominiums, hospitals, real estate developments, government offices).
- Check `src/infrastructure/search-sources/` to add or refine landmark coordinates and synonyms.

### 2. Vehicle Routing Profiles (`.lua`)
Customizing driving speeds for local transport modes:
- **Bajaj / 3-Wheelers**: Excluding expressways, ring roads, and prioritizing neighborhood streets.
- **Motorbikes / Delivery Couriers**: Adjusted speeds for city delivery traffic and shortcuts.
- **Lada & Minibus Taxis**: Key transit corridors and taxi stand nodes.

### 3. OpenStreetMap Data Improvements
The core routing graph is built directly from OpenStreetMap data. 
- You can map missing streets, roundabouts, and road names directly on [OpenStreetMap.org](https://www.openstreetmap.org).
- Our build pipeline automatically ingests updated Geofabrik Ethiopia extracts.

---

## Local Development Workflow

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/your-org/open-ethiopia-map.git
cd open-ethiopia-map

# 2. Install Node dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Start local development environment with Docker
docker compose up -d --build
```

---

## Submitting Pull Requests

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/addis-ababa-landmarks`.
3. Commit your changes with clear commit messages: `git commit -m "feat: add 50 new Bole landmark POIs"`.
4. Push to your branch: `git push origin feature/addis-ababa-landmarks`.
5. Open a Pull Request on GitHub.
