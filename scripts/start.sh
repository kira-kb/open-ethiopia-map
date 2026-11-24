#!/bin/sh
set -e

echo "=========================================================="
echo "🇪🇹 Open Ethiopia Map & Routing Platform"
echo "=========================================================="

DATA_DIR="/data"
ROADS_OSRM="${DATA_DIR}/ethiopia-roads.osrm"
LATEST_OSRM="${DATA_DIR}/ethiopia-latest.osrm"

# Prefer lightweight filtered graph, fallback to full graph
if [ -f "${ROADS_OSRM}.mldgr" ] || [ -f "${ROADS_OSRM}.cells" ] || [ -f "${ROADS_OSRM}" ]; then
  OSRM_BASE="${ROADS_OSRM}"
  echo "✅ Found pre-compiled lightweight road graph: ${OSRM_BASE}"
elif [ -f "${LATEST_OSRM}.mldgr" ] || [ -f "${LATEST_OSRM}.cells" ] || [ -f "${LATEST_OSRM}" ]; then
  OSRM_BASE="${LATEST_OSRM}"
  echo "✅ Found pre-compiled standard map graph: ${OSRM_BASE}"
else
  OSRM_BASE="${ROADS_OSRM}"
  echo "📥 Pre-compiled OSRM graph not found. Checking OSM data..."
  
  ROADS_FILE="${DATA_DIR}/ethiopia-roads.osm.pbf"
  OSM_FILE="${DATA_DIR}/ethiopia-latest.osm.pbf"

  if [ ! -f "${ROADS_FILE}" ] && [ ! -f "${OSM_FILE}" ]; then
    echo "🌍 Downloading latest Ethiopia OSM data from Geofabrik (~130 MB)..."
    mkdir -p "${DATA_DIR}"
    wget -O "${OSM_FILE}" https://download.geofabrik.de/africa/ethiopia-latest.osm.pbf
  fi

  TARGET_PBF="${ROADS_FILE}"
  if [ ! -f "${ROADS_FILE}" ] && [ -f "${OSM_FILE}" ]; then
    TARGET_PBF="${OSM_FILE}"
  fi

  PROFILE_PATH="/app/docker/profiles/ethiopia-unified.lua"
  if [ ! -f "${PROFILE_PATH}" ]; then
    PROFILE_PATH="/opt/car.lua"
  fi

  echo "⚙️ Extracting routing graph with profile (${PROFILE_PATH})..."
  osrm-extract -p "${PROFILE_PATH}" "${TARGET_PBF}"

  echo "⚙️ Partitioning graph for Multi-Level Dijkstra (MLD)..."
  osrm-partition "${OSRM_BASE}"

  echo "⚙️ Customizing speed & turn weights..."
  osrm-customize "${OSRM_BASE}"

  echo "✅ OSRM graph preparation complete!"
fi

# 2. Start OSRM routing engine in background
OSRM_PORT="${OSRM_INTERNAL_PORT:-5000}"
echo "🚀 Starting OSRM routing engine on 127.0.0.1:${OSRM_PORT}..."
osrm-routed --algorithm mld "${OSRM_BASE}" --port "${OSRM_PORT}" --max-matching-size 500 &
OSRM_PID=$!

# Wait for OSRM to become responsive
echo "⏳ Waiting for OSRM to initialize..."
until curl -s "http://127.0.0.1:${OSRM_PORT}/nearest/v1/driving/38.7578,8.9806" > /dev/null 2>&1; do
  sleep 1
done
echo "✅ OSRM routing engine is online!"

# 3. Apply Prisma database migrations / schema push if DATABASE_URL is configured
if [ -n "$MAP_DATABASE_URL" ] || [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Checking database schema..."
  npx prisma db push --skip-generate || echo "⚠️ Database schema sync skipped or failed (running with available tables)."
fi

# 4. Start Node.js Map Service
PUBLIC_PORT="${PORT:-7860}"
export PORT="${PUBLIC_PORT}"
export OSRM_BASE_URL="http://127.0.0.1:${OSRM_PORT}"

echo "🚀 Starting Open Ethiopia Map API Service on port ${PUBLIC_PORT}..."
exec node dist/src/index.js
