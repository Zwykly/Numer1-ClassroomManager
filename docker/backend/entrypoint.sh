#!/bin/sh
set -e

echo "==> Applying database migrations..."
tries=0
until bun run db:migrate; do
  tries=$((tries + 1))
  if [ "$tries" -ge 30 ]; then
    echo "Database did not become ready in time, giving up." >&2
    exit 1
  fi
  echo "Database not ready yet (attempt ${tries}), retrying in 2s..."
  sleep 2
done

echo "==> Ensuring the initial admin account exists..."
bun run seed:admin

echo "==> Starting backend..."
exec bun run start
