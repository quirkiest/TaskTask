#!/usr/bin/env bash
set -e  # stop on first error

# Resolve the app/ directory relative to this script,
# so it works regardless of where you call it from.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

docker build -t tasktask .
docker run -d --restart unless-stopped --name tasktask -p 8080:80 tasktask
echo "TaskTask running at http://localhost:8080"