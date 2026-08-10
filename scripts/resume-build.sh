#!/bin/bash
set -euo pipefail
cd /srv/yaghoot/app

echo "==> prisma generate"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npx prisma generate'

echo "==> seed"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npm run db:seed'

echo "==> remove demo buyer"
sqlite3 /srv/yaghoot/data/prod.db "DELETE FROM User WHERE phone='09120000000';"
echo "changes=$(sqlite3 /srv/yaghoot/data/prod.db "SELECT COUNT(*) FROM User WHERE phone='09120000000';")"

echo "==> build"
sudo -u yaghoot -H bash -lc 'cd /srv/yaghoot/app && set -a && . ./.env && set +a && npm run build'

echo BUILD_OK
ls -la /srv/yaghoot/data
ls -la /srv/yaghoot/app/.next | head
