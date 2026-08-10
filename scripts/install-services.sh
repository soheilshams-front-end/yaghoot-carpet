#!/bin/bash
set -euo pipefail

echo "==> Install systemd unit"
install -m 644 /tmp/yaghoot.service /etc/systemd/system/yaghoot.service
systemctl daemon-reload
systemctl enable yaghoot
systemctl restart yaghoot
sleep 2
systemctl --no-pager --full status yaghoot | head -25
ss -tlnp | grep 3000 || echo "WARN: port 3000 not listening yet"

echo "==> Install nginx config"
install -m 644 /tmp/nginx-yaghootcarpet.conf /etc/nginx/sites-available/yaghootcarpet
ln -sfn /etc/nginx/sites-available/yaghootcarpet /etc/nginx/sites-enabled/yaghootcarpet
# remove default if present
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Install backup + deploy scripts"
install -m 750 /tmp/backup.sh /srv/yaghoot/backup.sh
install -m 750 /tmp/deploy.sh /srv/yaghoot/deploy.sh
chown root:yaghoot /srv/yaghoot/backup.sh /srv/yaghoot/deploy.sh
# deploy must be runnable by yaghoot
chown yaghoot:yaghoot /srv/yaghoot/deploy.sh
chmod 750 /srv/yaghoot/deploy.sh /srv/yaghoot/backup.sh

# Cron: daily backup at 03:15
CRON_LINE="15 3 * * * root /srv/yaghoot/backup.sh >> /var/log/yaghoot-backup.log 2>&1"
if [ -f /etc/cron.d/yaghoot-backup ]; then
  true
fi
echo "$CRON_LINE" >/etc/cron.d/yaghoot-backup
chmod 644 /etc/cron.d/yaghoot-backup

echo "==> Certbot renew dry-run"
certbot renew --dry-run || echo "certbot dry-run warning"

echo "==> Smoke local curl"
sleep 1
curl -sI -m 10 http://127.0.0.1:3000/ | head -15 || true
curl -sI -m 10 https://yaghootcarpet.com/ | head -20 || true

echo INSTALL_DONE
