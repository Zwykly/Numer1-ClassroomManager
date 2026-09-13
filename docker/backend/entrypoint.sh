#!/bin/sh
set -e

echo "==> Applying database migrations..."
bun run db:migrate

echo "==> Ensuring the initial admin account exists..."
bun run seed:admin

echo "==> Starting backend..."
exec bun run start
