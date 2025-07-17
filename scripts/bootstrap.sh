#!/bin/bash
# Bootstrap local development environment
set -e

# always run from repository root so the script works from anywhere
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DIR")"
cd "$ROOT"

# install node dependencies
PNPM_ENABLE_PRE_POST_INSTALL_SCRIPTS=1 pnpm install --fix-lockfile
pnpm run prepare          # approve once, без рекурсии

# start Postgres and observability stack
docker-compose up -d db prometheus tempo promtail grafana

# run database migrations
pnpm --filter api run migration:run

# show helpful URLs

PORT_VAR=${PORT:-4000}
echo "Environment ready. API: http://localhost:$PORT_VAR"
echo "Grafana: http://localhost:3000"
