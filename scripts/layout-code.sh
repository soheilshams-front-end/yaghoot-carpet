#!/bin/bash
set -euo pipefail

REPO="https://github.com/soheilshams-front-end/yaghoot-carpet.git"
BASE=/srv/yaghoot

echo "==> Create directory layout"
mkdir -p "$BASE/app" "$BASE/data/uploads" "$BASE/backups"
chown -R yaghoot:yaghoot "$BASE"

echo "==> Clone / refresh app as yaghoot"
if [ -d "$BASE/app/.git" ]; then
  sudo -u yaghoot -H git -C "$BASE/app" fetch --all --prune
  sudo -u yaghoot -H git -C "$BASE/app" reset --hard origin/main
  sudo -u yaghoot -H git -C "$BASE/app" clean -fd
else
  rm -rf "$BASE/app"
  sudo -u yaghoot -H git clone --branch main --depth 1 "$REPO" "$BASE/app"
fi

echo "==> Symlink uploads to persistent data"
# If public/uploads is a real dir with content, move it first
if [ -d "$BASE/app/public/uploads" ] && [ ! -L "$BASE/app/public/uploads" ]; then
  if [ "$(ls -A "$BASE/app/public/uploads" 2>/dev/null || true)" ]; then
    cp -a "$BASE/app/public/uploads/." "$BASE/data/uploads/"
  fi
  rm -rf "$BASE/app/public/uploads"
fi
sudo -u yaghoot -H mkdir -p "$BASE/app/public"
ln -sfn "$BASE/data/uploads" "$BASE/app/public/uploads"
chown -h yaghoot:yaghoot "$BASE/app/public/uploads"
chown -R yaghoot:yaghoot "$BASE/data/uploads"

echo "==> Layout done"
ls -la "$BASE"
ls -la "$BASE/app" | head -30
ls -la "$BASE/app/public"
sudo -u yaghoot -H git -C "$BASE/app" log -1 --oneline
