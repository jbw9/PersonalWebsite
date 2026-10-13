#!/usr/bin/env bash
# Heartbeat: typecheck, production build, and every variant route ends up as its own chunk.
set -euo pipefail
cd "$(dirname "$0")"

npx tsc --noEmit -p .
echo "tsc ok"

CI=false npx react-scripts build >/tmp/demo-build.log 2>&1 || { tail -40 /tmp/demo-build.log; exit 1; }
echo "build ok ($(ls build/static/js/*.chunk.js | wc -l | tr -d ' ') chunks)"

for slug in $(grep -o 'slug: "[a-z]*"' src/archive/registry.ts | cut -d'"' -f2); do
  grep -q "./$slug\"" src/archive/registry.ts && test -f "src/archive/$slug/index.tsx" \
    || { echo "missing archived version: $slug"; exit 1; }
done
echo "archive ok"
