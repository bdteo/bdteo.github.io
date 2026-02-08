#!/usr/bin/env bash
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${REMOTE_APP_PATH:?REMOTE_APP_PATH is required}"
SSH_PORT="${SSH_PORT:-22}"
KEY_FILE="${SSH_KEY_PATH:-key.pem}"

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
# Releases dir sits next to the app dir (matches Makefile convention)
RELEASES_DIR="$(dirname "$REMOTE_APP_PATH")/bdteo.com-releases"
SSH_OPTS="-i $KEY_FILE -p $SSH_PORT -o StrictHostKeyChecking=no"
SSH_CMD="ssh $SSH_OPTS $SSH_USER@$SSH_HOST"

echo "[deploy] Creating release directory on VPS..."
$SSH_CMD "mkdir -p '$RELEASES_DIR/$TIMESTAMP'"

echo "[deploy] Uploading public/ to VPS..."
rsync -az --delete \
  -e "ssh $SSH_OPTS" \
  public/ "$SSH_USER@$SSH_HOST:$RELEASES_DIR/$TIMESTAMP/public/"

echo "[deploy] Atomically swapping symlink..."
$SSH_CMD "
  ln -sfn '$RELEASES_DIR/$TIMESTAMP/public' '$REMOTE_APP_PATH/public.tmp'
  mv -Tf '$REMOTE_APP_PATH/public.tmp' '$REMOTE_APP_PATH/public'
  echo '[deploy] Live: $RELEASES_DIR/$TIMESTAMP/public'
  echo '[deploy] Cleaning old releases...'
  ls -1dt '$RELEASES_DIR'/20* 2>/dev/null | tail -n +11 | xargs -r rm -rf || true
"

echo "[deploy] Done."
