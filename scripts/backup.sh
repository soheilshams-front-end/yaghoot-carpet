#!/bin/bash
set -euo pipefail

BACKUP_ROOT=/srv/yaghoot/backups
DB=/srv/yaghoot/data/prod.db
UPLOADS=/srv/yaghoot/data/uploads
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DAY_DIR="$BACKUP_ROOT/$DATE"

mkdir -p "$DAY_DIR"

if [ -f "$DB" ]; then
  sqlite3 "$DB" ".backup '$DAY_DIR/prod.db'"
  gzip -f "$DAY_DIR/prod.db"
fi

if [ -d "$UPLOADS" ]; then
  tar -czf "$DAY_DIR/uploads.tar.gz" -C "$UPLOADS" .
fi

# Keep 14 days
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +

echo "Backup completed: $DAY_DIR"
ls -la "$DAY_DIR"
