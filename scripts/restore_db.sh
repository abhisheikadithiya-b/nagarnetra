#!/usr/bin/env bash
# NagarNetra Database Restore Utility
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <path-to-backup-file.sql.gz|path-to-backup.db.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [[ "$BACKUP_FILE" == *".sql.gz"* ]]; then
  echo "[RESTORE] Restoring PostgreSQL from $BACKUP_FILE..."
  gunzip -c "$BACKUP_FILE" | psql "${DATABASE_URL:-postgresql://nagarnetra:postgis_secure_pass@localhost:5432/nagarnetra_prod}"
  echo "[RESTORE] PostgreSQL restore complete."
elif [[ "$BACKUP_FILE" == *".db.gz"* ]] || [[ "$BACKUP_FILE" == *".db"* ]]; then
  echo "[RESTORE] Restoring SQLite database..."
  if [[ "$BACKUP_FILE" == *".gz" ]]; then
    gunzip -c "$BACKUP_FILE" > backend/nagarnetra.db
  else
    cp "$BACKUP_FILE" backend/nagarnetra.db
  fi
  echo "[RESTORE] SQLite restore complete."
else
  echo "Unknown backup format: $BACKUP_FILE"
  exit 1
fi
