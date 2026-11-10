#!/usr/bin/env bash
# Backup: baza de date (pg_dump, format custom) + media (tar.gz), cu sume de control.
# Utilizare: DATABASE_URL=... MEDIA_DIR=./media BACKUP_DIR=./backups scripts/backup.sh
# Copiază apoi directorul rezultat într-o locație SEPARATĂ de server (vezi docs/RUNBOOK.md).
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL lipsește}"
MEDIA_DIR="${MEDIA_DIR:-./media}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/$STAMP"
mkdir -p "$OUT"
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file="$OUT/db.dump"
if [ -d "$MEDIA_DIR" ]; then tar -czf "$OUT/media.tar.gz" -C "$MEDIA_DIR" .; else echo "Atenție: $MEDIA_DIR nu există, media nu a fost inclusă." >&2; fi
(cd "$OUT" && sha256sum ./* > SHA256SUMS)
echo "Backup creat: $OUT"
