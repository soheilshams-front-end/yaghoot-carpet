#!/bin/bash
set -euo pipefail

APP=/srv/yaghoot/app
cd "$APP"

echo "==> npm ci"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && npm ci'

echo "==> Ensure data dir ownership"
touch /srv/yaghoot/data/prod.db
chown yaghoot:yaghoot /srv/yaghoot/data/prod.db
chmod 660 /srv/yaghoot/data/prod.db

echo "==> prisma generate + db push"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npx prisma generate && npx prisma db push'

echo "==> seed"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npm run db:seed'

echo "==> remove demo buyer 09120000000"
# Prefer sqlite3 when available (table name from Prisma model User)
if sqlite3 /srv/yaghoot/data/prod.db "DELETE FROM User WHERE phone='09120000000'; SELECT changes();"; then
  echo "demo user delete attempted via sqlite3"
else
  echo "sqlite3 delete failed; continuing"
fi

echo "==> npm run build"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npm run build'

echo "==> BUILD DONE"
ls -la /srv/yaghoot/data
ls -la /srv/yaghoot/app/.next | head
