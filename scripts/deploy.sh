#!/bin/bash
set -euo pipefail

APP=/srv/yaghoot/app
cd "$APP"

echo "==> git pull"
git fetch --all --prune
git reset --hard origin/main
git clean -fd

# Preserve uploads symlink
if [ ! -L public/uploads ]; then
  rm -rf public/uploads
  ln -sfn /srv/yaghoot/data/uploads public/uploads
fi

echo "==> npm ci"
npm ci

echo "==> prisma + build"
set -a
# shellcheck disable=SC1091
. ./.env
set +a
npx prisma generate
npx prisma db push
npm run build

echo "==> restart service"
sudo systemctl restart yaghoot
sudo systemctl --no-pager --full status yaghoot | head -20

echo "Deploy done"
