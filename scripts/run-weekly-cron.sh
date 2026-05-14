#!/usr/bin/env bash
# Triggers the weekly follow-up email cron via HTTPS.
# Used by Railway's native cron schedule (or any external cron pinger).
#
# Required env vars:
#   APP_URL       — e.g. https://goflytexas.com
#   CRON_SECRET   — shared secret matching the web service's env var
set -euo pipefail

: "${APP_URL:?APP_URL is required}"
: "${CRON_SECRET:?CRON_SECRET is required}"

curl -fsS -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL%/}/api/cron/weekly-followup"
echo
