#!/usr/bin/env bash
# Pull the newest published images and recreate the stack.
# Watchtower does this automatically; run this to update immediately.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling images..."
docker compose pull

echo "==> Recreating containers..."
docker compose up -d

echo "==> Removing dangling images..."
docker image prune -f

echo "==> Current status:"
docker compose ps
