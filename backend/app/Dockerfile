# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Classroom Manager - backend (Bun + Elysia + Drizzle)
# Build context is the repository root:
#   docker build -f backend/app/Dockerfile .
# ---------------------------------------------------------------------------

FROM oven/bun:alpine AS base
WORKDIR /app

# --- dependencies (keeps drizzle-kit, which is needed to apply migrations) --
FROM base AS deps
COPY backend/app/package.json backend/app/bun.lock ./
RUN bun install --frozen-lockfile

# --- runtime ---------------------------------------------------------------
FROM base AS release
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY backend/app/package.json backend/app/bun.lock ./
COPY backend/app/tsconfig.json ./
COPY backend/app/drizzle.config.ts ./
COPY backend/app/auth-schema.ts ./
COPY backend/app/src ./src
COPY backend/app/drizzle ./drizzle
COPY backend/app/seed-admin.ts ./seed-admin.ts
COPY docker/backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER bun
EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
