#!/bin/bash
set -e

echo "Applying migrations..."
for file in /docker-entrypoint-initdb.d/migrations/*.sql; do
  echo "Running $file..."
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
done
echo "Migrations applied successfully."
