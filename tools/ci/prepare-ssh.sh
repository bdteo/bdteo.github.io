#!/usr/bin/env bash
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY is required}"
SSH_PORT="${SSH_PORT:-22}"

KEY_FILE="key.pem"
KNOWN_HOSTS_FILE="known_hosts"

umask 077
printf "%s\n" "$SSH_PRIVATE_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

if command -v ssh-keyscan >/dev/null 2>&1; then
  ssh-keyscan -p "$SSH_PORT" "$SSH_HOST" > "$KNOWN_HOSTS_FILE" 2>/dev/null || true
fi

echo "[prepare-ssh] Wrote $KEY_FILE and $KNOWN_HOSTS_FILE"

if [[ -n "${GITHUB_ENV:-}" ]]; then
  echo "SSH_KEY_PATH=$KEY_FILE" >> "$GITHUB_ENV"
  echo "SSH_KNOWN_HOSTS=$KNOWN_HOSTS_FILE" >> "$GITHUB_ENV"
fi
