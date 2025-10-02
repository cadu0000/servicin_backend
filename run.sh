#!/bin/bash
set -e

POSTGRES_CONTAINER=${POSTGRES_CONTAINER:-servicin_postgres}
POSTGRES_USER=${POSTGRES_USER:-user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-12345678}
POSTGRES_DB=${POSTGRES_DB:-servicin}
POSTGRES_HOST_PORT=${POSTGRES_HOST_PORT:-5432}
POSTGRES_CONTAINER_PORT=${POSTGRES_CONTAINER_PORT:-5432}

usage() {
  echo "Uso: ./run.sh {up|down|restart|logs|psql|migrate}"
  exit 1
}

migrate() {
  echo "📦 Aplicando migrations..."
  docker exec -i $POSTGRES_CONTAINER bash -c "
    for file in /docker-entrypoint-initdb.d/migrations/*.sql; do
      echo \"Rodando \$file...\"
      psql -U $POSTGRES_USER -d $POSTGRES_DB -f \$file
    done
  "
  echo "✅ Migrations aplicadas."
}

wait_postgres() {
  echo "⏳ Esperando o Postgres iniciar..."
  until docker exec $POSTGRES_CONTAINER pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Postgres pronto!"
}

case "$1" in
  up)
    echo "🔹 Subindo containers..."
    docker compose up -d
    wait_postgres
    migrate
    ;;
  down)
    echo "🛑 Derrubando containers e removendo volumes..."
    docker compose down -v
    ;;
  restart)
    echo "🔄 Reiniciando containers..."
    docker compose down -v
    docker compose up -d
    wait_postgres
    migrate
    ;;
  logs)
    docker logs -f $POSTGRES_CONTAINER
    ;;
  psql)
    docker exec -it $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $POSTGRES_DB
    ;;
  migrate)
    wait_postgres
    migrate
    ;;
  *)
    usage
    ;;
esac
