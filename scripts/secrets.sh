#!/usr/bin/env bash
# Per-project secret manager backed by a OneDrive folder.
#
# Layout:
#   $SECRETS_ROOT/<project>/<KEY>      file content = value (single line, no quotes)
#
# Defaults:
#   SECRETS_ROOT = /mnt/c/Users/chris/OneDrive/Secrets
#   project      = contents of ./.secrets-project (in repo)
#   expected     = ./.secrets.expected (one KEY per line; lines starting with # ignored)
#
# Commands:
#   list                       expected keys + ✓/✗ presence + byte size
#   get  KEY                   print value (single line)
#   set  KEY [VALUE]           write value (prompts hidden if VALUE omitted)
#   unset KEY                  delete the secret file
#   pull [--out FILE]          write a .env-style file from the folder (default .env.local)
#   export                     emit JSON {KEY: VALUE} for all expected keys (to stdout)
#   check                      exit 1 if any expected key is missing
#   path                       print resolved $SECRETS_ROOT/<project>
#
# Anything in .secrets.expected is the source of truth. Extra files in the
# folder are ignored by `pull`/`export`/`check` but visible to `list`.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SECRETS_ROOT="${SECRETS_ROOT:-/mnt/c/Users/chris/OneDrive/Secrets}"
PROJECT_FILE="$REPO_ROOT/.secrets-project"
EXPECTED_FILE="$REPO_ROOT/.secrets.expected"

if [[ ! -f "$PROJECT_FILE" ]]; then
  echo "error: $PROJECT_FILE not found. Create it with the project name on a single line." >&2
  exit 2
fi
PROJECT="$(tr -d ' \r\n' < "$PROJECT_FILE")"

SECRETS_DIR="$SECRETS_ROOT/$PROJECT"

ensure_dir() {
  mkdir -p "$SECRETS_DIR"
}

expected_keys() {
  if [[ -f "$EXPECTED_FILE" ]]; then
    grep -vE '^\s*(#|$)' "$EXPECTED_FILE" | awk '{print $1}'
  fi
}

key_path() {
  local key="$1"
  if [[ ! "$key" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
    echo "error: key must match [A-Z_][A-Z0-9_]* (got: $key)" >&2
    exit 2
  fi
  echo "$SECRETS_DIR/$key"
}

read_value() {
  local key="$1"
  local file
  file="$(key_path "$key")"
  if [[ ! -f "$file" ]]; then
    echo "error: secret '$key' not found at $file" >&2
    exit 1
  fi
  # Strip trailing CR/LF only; preserve internal whitespace.
  tr -d '\r' < "$file" | awk 'NR>1{print prev; prev=$0; next}{prev=$0}END{printf "%s", prev}'
}

write_value() {
  local key="$1"
  local value="$2"
  local file
  file="$(key_path "$key")"
  ensure_dir
  # Strip trailing newlines just in case the caller passed one.
  printf '%s' "$value" | tr -d '\r' > "$file.tmp"
  mv "$file.tmp" "$file"
  chmod 600 "$file" 2>/dev/null || true
  echo "wrote $file ($(wc -c < "$file") bytes)"
}

cmd_path() {
  echo "$SECRETS_DIR"
}

cmd_list() {
  ensure_dir
  printf "Project: %s\nFolder:  %s\n\n" "$PROJECT" "$SECRETS_DIR"
  printf "%-30s %-6s %s\n" "KEY" "PRES" "BYTES"
  printf "%-30s %-6s %s\n" "------------------------------" "------" "-----"
  local missing=0
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    local f="$SECRETS_DIR/$key"
    if [[ -f "$f" ]]; then
      printf "%-30s %-6s %s\n" "$key" "✓" "$(wc -c < "$f")"
    else
      printf "%-30s %-6s %s\n" "$key" "✗" "(missing)"
      missing=$((missing + 1))
    fi
  done < <(expected_keys)
  if (( missing > 0 )); then
    echo
    echo "$missing expected key(s) missing. Run: $0 set <KEY>"
  fi
}

cmd_get() {
  local key="${1:-}"
  [[ -z "$key" ]] && { echo "usage: $0 get KEY" >&2; exit 2; }
  read_value "$key"
}

cmd_set() {
  local key="${1:-}"
  [[ -z "$key" ]] && { echo "usage: $0 set KEY [VALUE]" >&2; exit 2; }
  local value
  if [[ $# -ge 2 ]]; then
    value="$2"
  else
    # Read hidden from terminal
    read -rsp "Value for $key (hidden): " value
    echo
  fi
  write_value "$key" "$value"
}

cmd_unset() {
  local key="${1:-}"
  [[ -z "$key" ]] && { echo "usage: $0 unset KEY" >&2; exit 2; }
  local file
  file="$(key_path "$key")"
  if [[ -f "$file" ]]; then
    rm -f "$file"
    echo "removed $file"
  else
    echo "secret '$key' was not set"
  fi
}

cmd_pull() {
  local out="$REPO_ROOT/.env.local"
  if [[ "${1:-}" == "--out" && -n "${2:-}" ]]; then
    out="$2"
  fi
  ensure_dir
  : > "$out.tmp"
  local count=0
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    local f="$SECRETS_DIR/$key"
    if [[ -f "$f" ]]; then
      local value
      value="$(read_value "$key")"
      # Single-quote escape: replace ' with '\'' inside the value
      local escaped="${value//\'/\'\\\'\'}"
      printf "%s='%s'\n" "$key" "$escaped" >> "$out.tmp"
      count=$((count + 1))
    fi
  done < <(expected_keys)
  mv "$out.tmp" "$out"
  chmod 600 "$out" 2>/dev/null || true
  echo "wrote $count key(s) to $out"
}

cmd_export() {
  ensure_dir
  printf '{'
  local first=1
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    local f="$SECRETS_DIR/$key"
    [[ -f "$f" ]] || continue
    local value
    value="$(read_value "$key")"
    # JSON-escape value
    local escaped
    escaped=$(printf '%s' "$value" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    if (( first )); then first=0; else printf ','; fi
    printf '"%s":%s' "$key" "$escaped"
  done < <(expected_keys)
  printf '}\n'
}

cmd_check() {
  ensure_dir
  local missing=()
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    [[ -f "$SECRETS_DIR/$key" ]] || missing+=("$key")
  done < <(expected_keys)
  if (( ${#missing[@]} > 0 )); then
    echo "Missing: ${missing[*]}" >&2
    exit 1
  fi
  echo "All expected keys present in $SECRETS_DIR"
}

usage() {
  sed -n '1,/^set -euo pipefail/p' "$0" | sed -e 's/^# \{0,1\}//;1d;$d'
  exit 1
}

cmd="${1:-}"
shift || true
case "$cmd" in
  list)   cmd_list "$@" ;;
  get)    cmd_get "$@" ;;
  set)    cmd_set "$@" ;;
  unset)  cmd_unset "$@" ;;
  pull)   cmd_pull "$@" ;;
  export) cmd_export "$@" ;;
  check)  cmd_check "$@" ;;
  path)   cmd_path "$@" ;;
  ""|-h|--help|help) usage ;;
  *) echo "unknown command: $cmd" >&2; usage ;;
esac
