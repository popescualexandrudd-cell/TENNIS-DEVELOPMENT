#!/usr/bin/env bash
# Restaurare dintr-un director creat de backup.sh. SUPRASCRIE baza țintă și media țintă.
# Utilizare: DATABASE_URL=... MEDIA_DIR=./media scripts/restore.sh backups/<STAMP> [--yes]
set -euo pipefail
SRC="${1:?Indică directorul de backup}"
: "${DATABASE_URL:?DATABASE_URL lipsește}"
MEDIA_DIR="${MEDIA_DIR:-./media}"
(cd "$SRC" && sha256sum --check --quiet SHA256SUMS)
if [ "${2:-}" != "--yes" ]; then
  read -r -p "Restaurez în baza indicată de DATABASE_URL și în $MEDIA_DIR (date existente suprascrise). Continui? [da/NU] " ans
  [ "$ans" = "da" ] || { echo "Anulat."; exit 1; }
fi
pg_restore --clean --if-exists --no-owner --no-privileges --single-transaction --dbname="$DATABASE_URL" "$SRC/db.dump"
if [ -f "$SRC/media.tar.gz" ]; then mkdir -p "$MEDIA_DIR" && tar -xzf "$SRC/media.tar.gz" -C "$MEDIA_DIR"; fi
echo "Restaurare finalizată din $SRC"
