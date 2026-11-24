#!/usr/bin/env bash
# ==============================================================================
# Compile OSRM Graph with Unified Ethiopian Profile
# Uses Multi-Level Dijkstra (MLD) for minimal memory footprint (< 250MB RAM)
# ==============================================================================

set -euo pipefail

DATA_DIR="${1:-./data}"
ROADS_PBF="${DATA_DIR}/ethiopia-roads.osm.pbf"
PROFILE_LUA="${2:-./docker/profiles/ethiopia-unified.lua}"
OSRM_BASE="${DATA_DIR}/ethiopia-roads.osrm"

if [ ! -f "${ROADS_PBF}" ]; then
  echo "⚠️ ${ROADS_PBF} not found. Running road filter first..."
  ./scripts/filter-roads.sh "${DATA_DIR}"
fi

echo "⚙️ Extracting routing graph with unified profile: ${PROFILE_LUA}..."
osrm-extract -p "${PROFILE_LUA}" "${ROADS_PBF}"

echo "⚙️ Partitioning graph for Multi-Level Dijkstra (MLD)..."
osrm-partition "${OSRM_BASE}"

echo "⚙️ Customizing speed & turn weights..."
osrm-customize "${OSRM_BASE}"

echo "✅ OSRM graph compilation complete: ${OSRM_BASE}"
ls -lh "${OSRM_BASE}"*
