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

# Nginx serves /uploads straight from /srv/yaghoot/data/uploads and the app
# writes there through UPLOADS_DIR, so public/uploads must stay a plain empty
# directory — as a symlink out of the project root it panics Turbopack.
echo "==> ensure public/uploads is not a symlink"
if [ -L public/uploads ]; then
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

echo "==> restart service"
if sudo -n systemctl restart yaghoot 2>/dev/null; then
  sudo -n systemctl --no-pager --full status yaghoot | head -20
else
  echo "!! no passwordless sudo here — finish as root: systemctl restart yaghoot"
fi

echo "Deploy done"
