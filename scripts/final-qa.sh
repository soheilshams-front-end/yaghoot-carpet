#!/bin/bash
set -euo pipefail

echo "==> HTTP -> HTTPS"
curl -sI -m 10 http://yaghootcarpet.com/ | head -8

echo "==> www -> apex"
curl -sI -m 10 https://www.yaghootcarpet.com/ | head -8

echo "==> login"
curl -sI -m 10 https://yaghootcarpet.com/login | head -10

echo "==> rugs"
curl -sI -m 10 https://yaghootcarpet.com/rugs | head -8

echo "==> dashboard redirect without auth (expect 307/302 to login)"
curl -sI -m 10 https://yaghootcarpet.com/dashboard | head -12

echo "==> admin path redirect without auth"
curl -sI -m 10 https://yaghootcarpet.com/yaqoot-cms | head -12

echo "==> run backup once"
/srv/yaghoot/backup.sh

echo "==> users in db"
sqlite3 /srv/yaghoot/data/prod.db "SELECT phone, role FROM User;"

echo "==> service status"
systemctl is-active yaghoot
systemctl is-active nginx

echo "==> credentials file"
cat /root/yaghoot-admin-credentials.txt

echo QA_DONE
