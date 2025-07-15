#!/bin/bash
set -e
# Start full stack locally
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DIR")"
cd "$ROOT"

# bootstrap dependencies
"$DIR"/bootstrap.sh

# build API once
pnpm --filter api run build

# start API and worker in background
node apps/api/dist/index.js &
API_PID=$!
pnpm poller:dev &
WORKER_PID=$!

trap 'kill $API_PID $WORKER_PID' EXIT
wait
