#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-pocketbase-railway-template:smoke}"
CONTAINER="pb-railway-smoke-$(date +%s)-$$"
DATA_DIR="$(mktemp -d)"

cleanup() {
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
  rm -rf "${DATA_DIR}"
}
trap cleanup EXIT

docker build -t "${IMAGE}" .

docker run -d \
  --name "${CONTAINER}" \
  -e PORT=8080 \
  -v "${DATA_DIR}:/pb/pb_data" \
  -p 127.0.0.1::8080 \
  "${IMAGE}" >/dev/null

MAPPED_PORT="$(docker port "${CONTAINER}" 8080/tcp | awk -F: 'NR == 1 {print $NF}')"
HEALTH_URL="http://127.0.0.1:${MAPPED_PORT}/api/health"

for attempt in $(seq 1 60); do
  if curl -fsS "${HEALTH_URL}" >/dev/null; then
    docker exec "${CONTAINER}" test -d /pb/pb_data
    echo "PocketBase Docker smoke test passed: ${HEALTH_URL}"
    exit 0
  fi
  sleep 1
done

echo "PocketBase did not become healthy: ${HEALTH_URL}" >&2
docker logs "${CONTAINER}" >&2 || true
exit 1
