#!/usr/bin/env bash
# NagarNetra Database Backup Utility
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/nagarnetra}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

if [ -n "${DATABASE_URL:-}" ] && [[ "$DATABASE_URL" == *"postgres"* ]]; then
  echo "[BACKUP] Dumping PostgreSQL production database..."
  BACKUP_FILE="${BACKUP_DIR}/nagarnetra_pg_${TIMESTAMP}.sql.gz"
  pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
  echo "[BACKUP] Completed: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "[BACKUP] Backing up SQLite local database..."
  BACKUP_FILE="${BACKUP_DIR}/nagarnetra_sqlite_${TIMESTAMP}.db"
  sqlite3 backend/nagarnetra.db ".backup '$BACKUP_FILE'"
  gzip -f "$BACKUP_FILE"
  echo "[BACKUP] Completed: ${BACKUP_FILE}.gz"
fi

# Prune backups older than 14 days
find "$BACKUP_DIR" -type f -name "nagarnetra_*" -mtime +14 -delete
