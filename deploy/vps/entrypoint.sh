#!/bin/sh
# Apply D1 migrations, then serve the origin on loopback for the reverse proxy.
set -eu
cd /app
if [ ! -f .dev.vars ]; then
  echo "entrypoint: missing /app/.dev.vars (OPERATOR_TOKEN, IP_HASH_PEPPER)" >&2
  exit 1
fi
wrangler=node_modules/.bin/wrangler
"$wrangler" d1 migrations apply DB --local --persist-to /data -c wrangler.vps.jsonc
exec "$wrangler" dev -c wrangler.vps.jsonc --local \
  --ip "${PAIRFOB_LISTEN_IP:-127.0.0.1}" --port "${PAIRFOB_LISTEN_PORT:-18786}" \
  --inspector-port "${PAIRFOB_INSPECTOR_PORT:-18787}" \
  --persist-to /data --show-interactive-dev-session=false
