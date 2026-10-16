#!/usr/bin/env bash
# Build the Docker context for the self-hosted origin as a tarball.
# Run on linux-x64 (workerd ships per-platform binaries) from a clean checkout
# after `bun run build` in pwa/ and scripts/pack-origin-assets.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORIGIN="$ROOT/workers/pairfob-origin"
rev="$(git -C "$ROOT" rev-parse --short HEAD)"
out="${1:-$PWD/pairfob-origin-$rev.tgz}"

if [[ ! -f "$ORIGIN/public-dist/pair-shell.asset" ]]; then
  echo "package: missing public-dist; run scripts/pack-origin-assets.sh first" >&2
  exit 1
fi

ctx="$(mktemp -d)"
trap 'rm -rf "$ctx"' EXIT
cp -R "$ORIGIN/src" "$ORIGIN/migrations" "$ORIGIN/package.json" "$ORIGIN/bun.lock" \
  "$ORIGIN/tsconfig.json" "$ORIGIN/wrangler.vps.jsonc" "$ORIGIN/public-dist" "$ctx/"
cp "$ROOT/deploy/vps/Dockerfile" "$ROOT/deploy/vps/entrypoint.sh" "$ctx/"
# wrangler writes its temp files here; COPY --chown hands it to the node user.
mkdir "$ctx/.wrangler"
sed -i "s/\"BUILD\": \"selfhost\"/\"BUILD\": \"selfhost-$rev\"/" "$ctx/wrangler.vps.jsonc"

# The runtime needs wrangler only. Dropping the test tooling from package.json
# lets bun prune the lockfile while keeping wrangler's locked dependency tree.
bun -e '
  const path = process.argv[1];
  const pkg = await Bun.file(path).json();
  pkg.devDependencies = { wrangler: pkg.devDependencies.wrangler };
  delete pkg.scripts;
  await Bun.write(path, JSON.stringify(pkg, null, 2) + "\n");
' "$ctx/package.json"
(cd "$ctx" && bun install --silent)

tar -czf "$out" -C "$ctx" .
echo "$out"
