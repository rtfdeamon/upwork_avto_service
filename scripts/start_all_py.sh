#!/bin/bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DIR")"
cd "$ROOT"

# Start infra
docker-compose up -d db prometheus tempo promtail grafana

# Python venv
if [ ! -d "python/.venv" ]; then
  python3 -m venv python/.venv
fi

source python/.venv/bin/activate
pip install -U pip
pip install -r python/requirements.txt

# Run API
export PORT=${PORT:-4000}
export DB_PORT=${DB_PORT:-5434}
uvicorn python.api.app:app --host 0.0.0.0 --port "$PORT"

