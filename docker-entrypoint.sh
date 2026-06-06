#!/bin/sh
set -eu

# Railway injects PORT at runtime. The fallback keeps the image easy to run
# locally with plain `docker run`.
: "${PORT:=8080}"

# Keep every persistent PocketBase artifact under the Railway Volume mount.
: "${PB_DATA_DIR:=/pb/pb_data}"
: "${PB_HOOKS_DIR:=/pb/pb_hooks}"
: "${PB_MIGRATIONS_DIR:=/pb/pb_migrations}"
: "${PB_PUBLIC_DIR:=/pb/pb_public}"

if [ "$#" -gt 0 ]; then
  exec pocketbase "$@"
fi

mkdir -p "${PB_DATA_DIR}"

exec pocketbase serve \
  --http="0.0.0.0:${PORT}" \
  --dir="${PB_DATA_DIR}" \
  --hooksDir="${PB_HOOKS_DIR}" \
  --migrationsDir="${PB_MIGRATIONS_DIR}" \
  --publicDir="${PB_PUBLIC_DIR}"
