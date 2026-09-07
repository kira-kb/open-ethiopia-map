# ==============================================================================
# Open Ethiopia Map & Routing Platform - Standalone Production Dockerfile
# Combines:
#   1. OSRM C++ Routing Engine (Ethiopia Road Network)
#   2. Node.js 20 Map Service (Autocomplete, Geocoding, Places, Saved Locations)
# Compatible with: Hugging Face Spaces (Port 7860), Oracle Cloud, Render, VPS
# ==============================================================================

# Stage 1: Build the Node.js TypeScript Map Service
FROM node:20-bookworm-slim AS node-builder

WORKDIR /app

# Install openssl for Prisma binary engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma/

RUN npm install

COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Stage 2: Final Multi-Process Runtime Image (OSRM + Node.js)
FROM ghcr.io/project-osrm/osrm-backend:latest

WORKDIR /app

# Install Node.js 20 runtime, curl, wget, ca-certificates
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up data directory for OSRM graph
RUN mkdir -p /data

# Copy built application & dependencies from node-builder
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/prisma ./prisma
COPY --from=node-builder /app/prisma.config.ts ./
COPY scripts/start.sh ./scripts/start.sh

RUN chmod +x ./scripts/start.sh

# Default environment configurations
ENV NODE_ENV=production
ENV PORT=7860
ENV OSRM_INTERNAL_PORT=5000
ENV OSRM_BASE_URL=http://127.0.0.1:5000
ENV MAP_CACHE_TTL_ROUTE=3600
ENV MAP_CACHE_TTL_AUTOCOMPLETE=1800
ENV MAP_CACHE_TTL_REVERSE=86400

# Expose public HTTP port (7860 is the standard port for Hugging Face Spaces)
EXPOSE 7860

CMD ["/app/scripts/start.sh"]
