#!/bin/bash
# Bootstrap local development environment
set -e
pnpm install

docker-compose up -d db prometheus tempo promtail grafana

pnpm --filter api run migration:run

PORT_VAR=${PORT:-4000}
echo "Environment ready. API: http://localhost:$PORT_VAR"
echo "Grafana: http://localhost:3000"
