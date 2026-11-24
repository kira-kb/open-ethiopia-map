#!/usr/bin/env bash
# ==============================================================================
# Filter Road Network for Ultra-Lean OSRM Compilation (< 250MB RAM)
# Strips trees, buildings, fences, farmland, rivers.
# PRESERVES 100% of all:
#   - highway=residential (neighborhood streets in Addis & Gondar)
#   - highway=service (driveways to compound / building gates)
#   - highway=living_street (narrow cobblestone alleys)
#   - highway=track (unpaved dirt roads in rural & hilly areas)
#   - surface=sett & surface=cobblestone (Chigign)
# ==============================================================================

set -euo pipefail

DATA_DIR="${1:-./data}"
INPUT_PBF="${DATA_DIR}/ethiopia-latest.osm.pbf"
OUTPUT_PBF="${DATA_DIR}/ethiopia-roads.osm.pbf"

mkdir -p "${DATA_DIR}"

if [ ! -f "${INPUT_PBF}" ]; then
  echo "📥 Downloading latest Ethiopia OSM data from Geofabrik (~130 MB)..."
  wget -O "${INPUT_PBF}" https://download.geofabrik.de/africa/ethiopia-latest.osm.pbf
fi

echo "⚙️  Extracting drivable and navigable road network (w/highway)..."

if command -v osmium >/dev/null 2>&1; then
  osmium tags-filter "${INPUT_PBF}" w/highway -o "${OUTPUT_PBF}" --overwrite
elif docker info >/dev/null 2>&1; then
  echo "🐳 Using dockerized osmium-tool..."
  docker run --rm -v "$(cd "${DATA_DIR}" && pwd):/data" stefda/osmium-tool \
    tags-filter /data/ethiopia-latest.osm.pbf w/highway -o /data/ethiopia-roads.osm.pbf --overwrite
else
  echo "⚠️ Neither osmium-tool nor Docker found locally. Using input PBF directly as fallback."
  cp "${INPUT_PBF}" "${OUTPUT_PBF}"
fi

echo "✅ Road filter complete: ${OUTPUT_PBF}"
if [ -f "${OUTPUT_PBF}" ]; then
  ls -lh "${OUTPUT_PBF}"
fi
