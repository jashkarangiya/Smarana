#!/usr/bin/env bash
set -euo pipefail

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  # Try to load from .env if present
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups

TS=$(date +%F_%H%M)
OUT="backups/smarana_${TS}.dump"

echo "Creating backup at $OUT..."

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump could not be found. Please install postgresql-client."
    exit 1
fi

pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner --no-acl \
  --file "$OUT"

echo "Backup created successfully: $OUT"
