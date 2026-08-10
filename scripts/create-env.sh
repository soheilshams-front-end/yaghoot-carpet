#!/bin/bash
set -euo pipefail

APP=/srv/yaghoot/app
ENV_FILE="$APP/.env"
CREDS=/root/yaghoot-admin-credentials.txt

AUTH_SECRET=$(openssl rand -base64 32)
ADMIN_PASS=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)

umask 077
cat >"$ENV_FILE" <<EOF
NODE_ENV=production
DATABASE_URL="file:/srv/yaghoot/data/prod.db"
AUTH_SECRET=${AUTH_SECRET}
AUTH_URL=https://yaghootcarpet.com
NEXT_PUBLIC_ADMIN_PATH=/yaqoot-cms
ADMIN_PHONE=09124496001
ADMIN_INITIAL_PASSWORD=${ADMIN_PASS}
STORAGE_DRIVER=local
EOF

chown yaghoot:yaghoot "$ENV_FILE"
chmod 600 "$ENV_FILE"

cat >"$CREDS" <<EOF
Yaghoot production credentials (generated $(date -u +%Y-%m-%dT%H:%MZ))
Admin phone: 09124496001
Admin password: ${ADMIN_PASS}
Admin panel: https://yaghootcarpet.com/yaqoot-cms
AUTH_SECRET stored only in ${ENV_FILE}
EOF
chmod 600 "$CREDS"

echo "==> .env created at $ENV_FILE"
ls -la "$ENV_FILE"
echo "Credentials written to $CREDS (root only)"
# show non-secret lines
grep -E '^(NODE_ENV|DATABASE_URL|AUTH_URL|NEXT_PUBLIC_ADMIN_PATH|ADMIN_PHONE|STORAGE_DRIVER)=' "$ENV_FILE"
