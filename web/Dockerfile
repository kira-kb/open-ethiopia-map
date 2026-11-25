# Multi-stage production build for Open Ethiopia Map Web Showcase & Playground
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

ARG NEXT_PUBLIC_MAP_API_URL=http://localhost:7860
ENV NEXT_PUBLIC_MAP_API_URL=${NEXT_PUBLIC_MAP_API_URL}

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
