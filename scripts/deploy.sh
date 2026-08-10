#!/bin/bash
set -euo pipefail

APP=/srv/yaghoot/app
cd "$APP"

echo "==> git pull"
git fetch --all --prune
git reset --hard origin/main
git clean -fd

echo "==> ensure UPLOADS_DIR in .env"
if ! grep -q '^UPLOADS_DIR=' .env 2>/dev/null; then
  echo 'UPLOADS_DIR=/srv/yaghoot/data/uploads' >> .env
fi
if ! grep -q '^NEXT_PUBLIC_SITE_URL=' .env 2>/dev/null; then
  echo 'NEXT_PUBLIC_SITE_URL=https://yaghootcarpet.com' >> .env
fi

# Turbopack panics if public/uploads is a symlink pointing outside the project.
# Nginx already serves /uploads from /srv/yaghoot/data/uploads, so the symlink
# is only needed as a local fallback — keep it off during build.
echo "==> detach uploads symlink for build"
UPLOADS_LINK_TARGET=""
if [ -L public/uploads ]; then
  UPLOADS_LINK_TARGET="$(readlink public/uploads || true)"
  rm -f public/uploads
fi
mkdir -p public/uploads

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

echo "==> restore uploads symlink"
rm -rf public/uploads
ln -sfn "${UPLOADS_LINK_TARGET:-/srv/yaghoot/data/uploads}" public/uploads

echo "==> restart service"
sudo systemctl restart yaghoot
sudo systemctl --no-pager --full status yaghoot | head -20

echo "Deploy done"
