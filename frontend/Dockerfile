# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Classroom Manager - frontend (Bun + React)
# Build context is the repository root:
#   docker build -f frontend/Dockerfile .
#
# The build stage preserves the repository layout because frontend/src/lib/eden.ts
# references the backend type source. The final image only ships the built bundle
# and the production server.
# ---------------------------------------------------------------------------

FROM oven/bun:alpine AS base
WORKDIR /repo

# --- dependencies ----------------------------------------------------------
FROM base AS deps
COPY frontend/package.json frontend/bun.lock ./frontend/
RUN cd frontend && bun install --frozen-lockfile

# --- build -----------------------------------------------------------------
FROM base AS build
COPY --from=deps /repo/frontend/node_modules ./frontend/node_modules
COPY frontend/package.json frontend/bun.lock frontend/bunfig.toml frontend/tsconfig.json frontend/build.ts ./frontend/
COPY frontend/src ./frontend/src
COPY backend/app/src ./backend/app/src
RUN cd frontend && bun run build.ts --public-path=/

# --- runtime ---------------------------------------------------------------
FROM oven/bun:alpine AS release
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/frontend/dist ./dist
COPY frontend/server.ts ./server.ts

USER bun
EXPOSE 3030

CMD ["bun", "server.ts"]
