# Self-hosted pairfob origin. Build context is workers/pairfob-origin with
# node_modules (bun install --frozen-lockfile on linux-x64) and a packed
# public-dist already in place: there are no RUN steps, so old Docker hosts
# whose default seccomp profile breaks glibc builds can still build it.
FROM node:22-bookworm-slim
WORKDIR /app
COPY --chown=node:node . /app
COPY --chown=node:node entrypoint.sh /entrypoint.sh
USER node
# Keep wrangler/Miniflare from calling Cloudflare (telemetry, cf.json).
ENV WRANGLER_SEND_METRICS=false \
    CLOUDFLARE_CF_FETCH_ENABLED=false \
    DO_NOT_TRACK=1 \
    CI=1
VOLUME /data
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
