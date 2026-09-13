#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${RCLONE_REMOTE:?RCLONE_REMOTE is required}"

INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RCLONE_CONFIG="${RCLONE_CONFIG:-/config/rclone.conf}"

mkdir -p "$BACKUP_DIR"

run_backup() {
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  file="$BACKUP_DIR/classroom_${timestamp}.sql.gz"

  echo "==> [$(date -u +%FT%TZ)] Dumping database..."
  if pg_dump "$DATABASE_URL" | gzip > "$file"; then
    echo "==> Dump created: $file ($(du -h "$file" | cut -f1))"
  else
    echo "!! pg_dump failed; removing partial dump." >&2
    rm -f "$file"
    return 1
  fi

  echo "==> Uploading to offsite remote: $RCLONE_REMOTE"
  if rclone copy "$file" "$RCLONE_REMOTE" --config "$RCLONE_CONFIG"; then
    echo "==> Offsite upload complete."
    rclone delete "$RCLONE_REMOTE" --min-age "${RETENTION_DAYS}d" --config "$RCLONE_CONFIG" || true
  else
    echo "!! rclone upload failed; keeping the local dump for the next run." >&2
  fi

  echo "==> Pruning local dumps older than ${RETENTION_DAYS} days..."
  find "$BACKUP_DIR" -type f -name 'classroom_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

  echo "==> Backup cycle finished."
}

if [ "${RUN_ONCE:-false}" = "true" ]; then
  run_backup
  exit $?
fi

while true; do
  run_backup || echo "!! Backup cycle failed; will retry next interval." >&2
  echo "==> Sleeping ${INTERVAL}s until the next backup..."
  sleep "$INTERVAL"
done
