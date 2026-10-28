#!/usr/bin/env bash
# Rebuilds past versions of the site straight from git into public/snapshots/<id>/, which /wayback shows.
# Needs full history (CI checks out with fetch-depth: 0). Ids and commits must match ERAS in src/site/wayback/eras.ts.
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
OUT="$ROOT/public/snapshots"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

build() {
  local id=$1 commit=$2 dir="$TMP/$1" base="/snapshots/$1"
  echo "── $id ($commit)"
  mkdir -p "$dir"
  git -C "$ROOT" archive "$commit" | tar -x -C "$dir"

  # Served from a subpath instead of the domain root: router basename, and absolute asset paths in the source
  perl -pi -e "s#<BrowserRouter>#<BrowserRouter basename=\"$base\">#" "$dir/src/index.tsx"
  find "$dir/src" -name '*.ts*' -exec perl -pi -e "s#([\"'\`(])/(?=[\w./-]+\.(?:png|jpe?g|svg|mp4|gif|webp|ico|pdf|dmg)\b)#\$1$base/#g" {} +
  # Old analytics would count every snapshot visit as a hit on today's homepage
  perl -0pi -e "s#<!-- Google tag.*?gtag\('config'.*?</script>##s" "$dir/public/index.html"
  find "$dir/src" -name '*.ts*' -exec perl -pi -e 's#ReactGA\.(initialize|send)\(#((..._: unknown[]) => {})(#g' {} +
  rm -f "$dir/public/404.html" "$dir/public/CNAME"

  (cd "$dir" && npm ci --no-audit --no-fund --loglevel=error && CI=false PUBLIC_URL="$base" GENERATE_SOURCEMAP=false npx react-scripts build)
  rm -rf "${OUT:?}/$id"
  mkdir -p "$OUT"
  cp -R "$dir/build" "$OUT/$id"
}

build 2024 dbb9cb4
build 2025 3cef60f
build 2026 fcbd5de
