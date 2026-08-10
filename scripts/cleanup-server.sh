#!/bin/bash
set -euo pipefail

echo "==> Stopping and removing PM2 app"
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete yaghoot-carpet 2>/dev/null || true
  pm2 save --force 2>/dev/null || true
  pm2 kill 2>/dev/null || true
fi

echo "==> Disabling pm2-root systemd unit"
systemctl disable --now pm2-root 2>/dev/null || true
rm -f /etc/systemd/system/pm2-root.service
systemctl daemon-reload || true

echo "==> Removing old app leftovers (preserving backups + letsencrypt)"
rm -rf /root/yaghoot-carpet
rm -f /root/backup-yaghoot.sh
# Keep /root/backups intact

echo "==> Removing old nginx site link (cert stays)"
rm -f /etc/nginx/sites-enabled/yaghootcarpet
# Keep sites-available copy temporarily as reference; will rewrite later
nginx -t && systemctl reload nginx || true

echo "==> Cleanup summary"
echo "PM2:"; command -v pm2 >/dev/null && pm2 list || echo "pm2 gone/inactive"
echo "ports:"; ss -tlnp | grep -E ':80|:443|:3000|:22' || true
echo "letsencrypt:"; ls /etc/letsencrypt/live || true
echo "backups:"; ls -la /root/backups/yaghoot-carpet || true
echo "DONE CLEANUP"
