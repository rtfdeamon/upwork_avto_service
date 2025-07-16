#!/bin/bash
set -e
# Start full stack locally
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DIR")"
cd "$ROOT"

# Ensure Docker CLI exists
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Follow https://docs.docker.com/get-docker/" >&2
  exit 1
fi

# Start Docker if it is not running
if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running." >&2
  if [[ "$(uname)" == "Darwin" ]] && command -v open >/dev/null 2>&1; then
    echo "Attempting to start Docker Desktop..." >&2
    open -a Docker >/dev/null 2>&1 || true
    until docker info >/dev/null 2>&1; do
      printf '.'
      sleep 2
    done
    echo
  elif command -v systemctl >/dev/null 2>&1; then
    echo "Trying to start docker service..." >&2
    sudo systemctl start docker || true
    until docker info >/dev/null 2>&1; do
      sleep 2
    done
  else
    echo "Please start Docker manually and retry." >&2
    exit 1
  fi
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
