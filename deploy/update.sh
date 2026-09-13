#!/usr/bin/env bash
# Manual update helper. Watchtower keeps the stack updated automatically;
# this script is useful for the very first deploy or for an explicit refresh.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Fetching latest main..."
git fetch origin main
git checkout main
git pull --ff-only origin main

echo "==> Pulling images and recreating containers..."
docker compose pull
docker compose up -d

echo "==> Removing dangling images..."
docker image prune -f

echo "==> Current status:"
docker compose ps
