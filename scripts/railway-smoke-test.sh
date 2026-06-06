#!/usr/bin/env bash
set -euo pipefail

if [[ "${RAILWAY_SMOKE_CREATE_PROJECT:-0}" != "1" ]]; then
  cat >&2 <<'MSG'
This script creates a temporary Railway project, deploys the current directory,
checks /api/health, and deletes the temporary project afterwards.

Run it explicitly with:

  RAILWAY_SMOKE_CREATE_PROJECT=1 scripts/railway-smoke-test.sh

Set KEEP_PROJECT=1 if you want to inspect the Railway project after the run.
MSG
  exit 2
fi

SESSION="${RAILWAY_AGENT_SESSION:-railway-smoke-$(date +%s)-$$}"
CALLER="${RAILWAY_CALLER:-skill:use-railway@1.2.2}"
PROJECT_NAME="${PROJECT_NAME:-pb-smoke-$(date +%m%d%H%M%S)}"
SERVICE_NAME="${SERVICE_NAME:-pocketbase}"
MOUNT_PATH="${MOUNT_PATH:-/pb/pb_data}"
PROJECT_ID=""

railway_cmd() {
  RAILWAY_CALLER="${CALLER}" RAILWAY_AGENT_SESSION="${SESSION}" railway "$@"
}

cleanup() {
  if [[ -n "${PROJECT_ID}" && "${KEEP_PROJECT:-0}" != "1" ]]; then
    railway_cmd project delete --project "${PROJECT_ID}" --yes --json >/dev/null 2>&1 || true
  fi
  rm -rf .railway
}
trap cleanup EXIT

command -v railway >/dev/null
railway_cmd whoami --json >/dev/null

INIT_JSON="$(railway_cmd init --name "${PROJECT_NAME}" --json)"
PROJECT_ID="$(node -e 'const data = JSON.parse(process.argv[1]); console.log(data.projectId || data.id || data.project?.id || "");' "${INIT_JSON}")"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Could not parse project id from railway init output: ${INIT_JSON}" >&2
  exit 1
fi

railway_cmd add --service "${SERVICE_NAME}" --json >/dev/null
railway_cmd service link "${SERVICE_NAME}" >/dev/null
railway_cmd volume add --mount-path "${MOUNT_PATH}" --json >/dev/null
railway_cmd variable set RAILWAY_RUN_UID=0 --service "${SERVICE_NAME}" --skip-deploys --json >/dev/null

DOMAIN_JSON="$(railway_cmd domain --service "${SERVICE_NAME}" --port 8080 --json)"
DOMAIN="$(node -e 'const data = JSON.parse(process.argv[1]); console.log(data.domain || data.url || data.serviceDomain || data.generatedDomain || "");' "${DOMAIN_JSON}")"
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN#http://}"

if ! railway_cmd up --ci -m "smoke: validate PocketBase Railway template"; then
  railway_cmd logs --service "${SERVICE_NAME}" --lines 200 || true
  exit 1
fi

if [[ -z "${DOMAIN}" ]]; then
  echo "Could not parse generated domain from railway domain output: ${DOMAIN_JSON}" >&2
  exit 1
fi

HEALTH_URL="https://${DOMAIN}/api/health"
for attempt in $(seq 1 90); do
  if curl -fsS "${HEALTH_URL}" >/dev/null; then
    echo "PocketBase Railway smoke test passed: ${HEALTH_URL}"
    exit 0
  fi
  sleep 2
done

echo "PocketBase did not become healthy on Railway: ${HEALTH_URL}" >&2
railway_cmd logs --service "${SERVICE_NAME}" --lines 200 || true
exit 1
