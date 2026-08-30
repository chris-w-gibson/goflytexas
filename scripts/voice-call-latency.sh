#!/usr/bin/env bash
# Per-turn latency report for the most recent Vapi call (or a given call id).
# Usage: scripts/voice-call-latency.sh [vapi_call_id]
# Needs ~/.config/goflytexas/voice.env (VAPI_API_KEY) and the Railway CLI linked.
set -euo pipefail
set -a; . "$HOME/.config/goflytexas/voice.env"; set +a

if [ "${1:-}" != "" ]; then
  CALL_JSON=$(curl -s --max-time 30 -H "Authorization: Bearer $VAPI_API_KEY" "https://api.vapi.ai/call/$1")
else
  CALL_JSON=$(curl -s --max-time 30 -H "Authorization: Bearer $VAPI_API_KEY" "https://api.vapi.ai/call?limit=1" | python3 -c 'import sys,json; print(json.dumps(json.load(sys.stdin)[0]))')
fi

CALL_ID=$(printf '%s' "$CALL_JSON" | python3 - <<'EOF'
import sys, json
c = json.load(sys.stdin)
print(c['id'])
print(f"call {c['id']} | {c.get('status')} | {c.get('endedReason')} | from {(c.get('customer') or {}).get('number')} | {c.get('startedAt')} -> {c.get('endedAt')} | cost ${c.get('cost')}", file=sys.stderr)
msgs = [m for m in ((c.get('artifact') or {}).get('messages') or []) if m.get('role') in ('user', 'bot')]
gaps = []
for i in range(1, len(msgs)):
    prev, cur = msgs[i - 1], msgs[i]
    if prev['role'] == 'user' and cur['role'] == 'bot' and prev.get('endTime') and cur.get('time'):
        g = (cur['time'] - prev['endTime']) / 1000
        gaps.append(g)
        print(f"  {g:5.2f}s  after: \"{prev.get('message', '')[:60]}\"", file=sys.stderr)
if gaps:
    s = sorted(gaps); n = len(s)
    print(f"turns={n} median={s[n // 2]:.2f}s p90={s[max(0, int(n * 0.9) - 1)]:.2f}s max={s[-1]:.2f}s", file=sys.stderr)
EOF
)

echo "--- our time-to-first-token (ms) for $CALL_ID"
cd "$(dirname "$0")/.."
timeout 40 railway logs -s goflytexas -e production 2>/dev/null | grep "voice llm ttft_ms $CALL_ID" | awk '{print "  turn " $5 ": " $6 " ms"}' || true
