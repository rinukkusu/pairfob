# Self-hosted origin

Runs `workers/pairfob-origin` with `wrangler dev --local` in Docker behind
nginx. Durable Objects and D1 persist in `/var/lib/pairfob-origin`. The
container sets `WRANGLER_SEND_METRICS=false` and
`CLOUDFLARE_CF_FETCH_ENABLED=false`, so it does not call Cloudflare.

## Build (linux-x64)

```sh
(cd pwa && bun install --frozen-lockfile && bun run build)
(cd workers/pairfob-origin && bun install --frozen-lockfile)
(cd site/doc && bun install --frozen-lockfile)
./scripts/pack-origin-assets.sh
./deploy/vps/package.sh /tmp/pairfob-origin.tgz
```

## Install on the host

```sh
mkdir -p /opt/pairfob-origin/build /var/lib/pairfob-origin
chown 1000:1000 /var/lib/pairfob-origin && chmod 700 /var/lib/pairfob-origin
tar -xzf pairfob-origin.tgz -C /opt/pairfob-origin/build

# Secrets, once. Mounted read-only as /app/.dev.vars.
umask 077
printf 'OPERATOR_TOKEN=%s\nIP_HASH_PEPPER=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" \
  > /opt/pairfob-origin/dev.vars
chown 1000:1000 /opt/pairfob-origin/dev.vars

docker build -t pairfob-origin:<rev> -f /opt/pairfob-origin/build/Dockerfile /opt/pairfob-origin/build
docker run -d --name pairfob-origin --restart always --network host \
  --security-opt seccomp=unconfined \
  -v /var/lib/pairfob-origin:/data \
  -v /opt/pairfob-origin/dev.vars:/app/.dev.vars:ro \
  --log-opt max-size=10m --log-opt max-file=3 \
  pairfob-origin:<rev>
curl -fsS http://127.0.0.1:18786/v2/health
```

`seccomp=unconfined` is only needed on old Docker releases whose default
profile rejects `clone3`.

## nginx, TLS, STUN

- `nginx-pairfob.conf` → `/etc/nginx/sites-available/pairfob`, linked into
  `sites-enabled`. It forwards WebSockets and sets `CF-Connecting-IP`, which
  the Worker uses for rate limits.
- Certificate: `certbot certonly --webroot -w /var/www/letsencrypt -d <domain>`.
- `turnserver.conf` → `/etc/turnserver.conf` (coturn, STUN only, 3478/udp).
  `STUN_URLS` in `wrangler.vps.jsonc` and `PAIRFOB_STUN_URLS` on daemons point
  at it.

## Daemons

```sh
PAIRFOB_ORIGIN=https://<domain>
PAIRFOB_STUN_URLS=stun:<domain>:3478
```

Pair from `https://<domain>/pair`.
