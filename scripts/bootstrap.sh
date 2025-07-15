#!/bin/bash
# Bootstrap local development environment
set -e
pnpm install

docker-compose up -d db prometheus tempo promtail grafana

pnpm --filter api run migration:run

echo "Environment ready. API: http://localhost:3000" 
echo "Grafana: http://localhost:3000"
