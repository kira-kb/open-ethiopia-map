#!/bin/sh
set -e

echo "=========================================================="
echo "🇪🇹 Open Ethiopia Map & Routing Platform"
echo "=========================================================="

DATA_DIR="${DATA_DIR:-/data}"
mkdir -p "${DATA_DIR}"

ROADS_OSRM="${DATA_DIR}/ethiopia-roads.osrm"
LATEST_OSRM="${DATA_DIR}/ethiopia-latest.osrm"

# Prefer pre-compiled graph if available on volume
if [ -f "${ROADS_OSRM}.mldgr" ] || [ -f "${ROADS_OSRM}.partition" ] || [ -f "${ROADS_OSRM}.cells" ]; then
  OSRM_BASE="${ROADS_OSRM}"
  echo "✅ Found pre-compiled lightweight road graph: ${OSRM_BASE}"
elif [ -f "${LATEST_OSRM}.mldgr" ] || [ -f "${LATEST_OSRM}.partition" ] || [ -f "${LATEST_OSRM}.cells" ]; then
  OSRM_BASE="${LATEST_OSRM}"
  echo "✅ Found pre-compiled standard map graph: ${OSRM_BASE}"
else
  echo "📥 Pre-compiled OSRM graph not found. Checking OSM data..."
  
  ROADS_FILE="${DATA_DIR}/ethiopia-roads.osm.pbf"
  OSM_FILE="${DATA_DIR}/ethiopia-latest.osm.pbf"

  if [ -f "${ROADS_FILE}" ]; then
    TARGET_PBF="${ROADS_FILE}"
  elif [ -f "${OSM_FILE}" ]; then
    TARGET_PBF="${OSM_FILE}"
  else
    echo "🌍 Downloading latest Ethiopia OSM data (~140 MB)..."
    if curl -fL --connect-timeout 15 --retry 2 -o "${OSM_FILE}" http://download.openstreetmap.fr/extracts/africa/ethiopia.osm.pbf; then
      echo "✅ Downloaded OSM data from openstreetmap.fr mirror"
    else
      echo "⚠️ Mirror failed, falling back to Geofabrik..."
      wget -O "${OSM_FILE}" https://download.geofabrik.de/africa/ethiopia-latest.osm.pbf
    fi
    TARGET_PBF="${OSM_FILE}"
  fi

  # Crucial fix: Derive OSRM_BASE directly from TARGET_PBF so extract, partition, and customize match!
  OSRM_BASE="${TARGET_PBF%.osm.pbf}.osrm"
  echo "🎯 Selected PBF source: ${TARGET_PBF}"
  echo "🎯 Derived OSRM base:   ${OSRM_BASE}"

  PROFILE_PATH="/app/docker/profiles/ethiopia-unified.lua"
  if [ ! -f "${PROFILE_PATH}" ]; then
    PROFILE_PATH="./docker/profiles/ethiopia-unified.lua"
  fi
  if [ ! -f "${PROFILE_PATH}" ]; then
    PROFILE_PATH="/opt/car.lua"
  fi

  if [ -d "/opt/lib" ] && [ ! -d "/app/docker/profiles/lib" ]; then
    mkdir -p "/app/docker/profiles/lib"
    cp -r /opt/lib/* "/app/docker/profiles/lib/" 2>/dev/null || true
  fi
  export LUA_PATH="/opt/?.lua;/opt/?/init.lua;/app/docker/profiles/?.lua;/app/docker/profiles/?/init.lua;${LUA_PATH:-};;"

  echo "⚙️ Extracting routing graph with profile (${PROFILE_PATH})..."
  osrm-extract -p "${PROFILE_PATH}" "${TARGET_PBF}"

  echo "⚙️ Partitioning graph for Multi-Level Dijkstra (MLD)..."
  osrm-partition "${OSRM_BASE}"

  echo "⚙️ Customizing speed & turn weights..."
  osrm-customize "${OSRM_BASE}"

  echo "✅ OSRM graph preparation complete: ${OSRM_BASE}"
fi

# 2. Start OSRM routing engine in background
OSRM_PORT="${OSRM_INTERNAL_PORT:-5000}"
echo "🚀 Starting OSRM routing engine on 127.0.0.1:${OSRM_PORT}..."
osrm-routed --algorithm mld "${OSRM_BASE}" --port "${OSRM_PORT}" --max-matching-size 500 &
OSRM_PID=$!

# Wait for OSRM to become responsive (up to 60s)
echo "⏳ Waiting for OSRM to initialize..."
RETRIES=60
while [ $RETRIES -gt 0 ]; do
  if ! kill -0 $OSRM_PID 2>/dev/null; then
    echo "❌ OSRM process died unexpectedly! Check logs above."
    exit 1
  fi
  if curl -s "http://127.0.0.1:${OSRM_PORT}/nearest/v1/driving/38.7578,8.9806" > /dev/null 2>&1; then
    echo "✅ OSRM routing engine is online!"
    break
  fi
  sleep 1
  RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ OSRM routing engine failed to become ready within 60s"
  exit 1
fi

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
if [ -f "dist/index.js" ]; then
  exec node dist/index.js
elif [ -f "dist/src/index.js" ]; then
  exec node dist/src/index.js
else
  exec node dist/index.js
fi
