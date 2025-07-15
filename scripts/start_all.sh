#!/bin/bash
set -e
# Start full stack locally
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DIR")"
cd "$ROOT"

# Ensure Docker daemon is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and retry." >&2
  exit 1
fi

# Ensure pnpm exists
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Install pnpm before running." >&2
  exit 1
fi

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
