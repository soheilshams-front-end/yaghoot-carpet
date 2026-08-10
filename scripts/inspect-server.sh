#!/bin/bash
set -e
echo "===== OS / HARDWARE ====="
uname -a
head -6 /etc/os-release
echo "---"
free -h
echo "---"
df -h /
echo "---"
swapon --show || true
echo "===== NODE / NPM ====="
(command -v node && node -v) || echo "no node"
(command -v npm && npm -v) || echo "no npm"
which node npm 2>/dev/null || true
echo "===== SERVICES ====="
systemctl is-active nginx 2>/dev/null || echo "nginx inactive"
systemctl is-active docker 2>/dev/null || echo "docker inactive"
systemctl is-active fail2ban 2>/dev/null || echo "fail2ban inactive"
systemctl is-active ufw 2>/dev/null || echo "ufw inactive"
systemctl list-units --type=service --state=running --no-pager | grep -Ei "nginx|node|pm2|docker|certbot|yaghoot|next" || true
echo "===== PM2 ====="
(command -v pm2 && pm2 list) || echo "no pm2"
echo "===== DOCKER ====="
(command -v docker && docker ps -a) || echo "no docker"
echo "===== LISTENING PORTS ====="
ss -tlnp | grep -E ":80|:443|:3000|:22" || true
echo "===== NGINX ====="
ls -la /etc/nginx/sites-enabled 2>/dev/null || true
ls -la /etc/nginx/conf.d 2>/dev/null || true
echo "--- sites-enabled contents ---"
for f in /etc/nginx/sites-enabled/*; do
  if [ -f "$f" ]; then
    echo "FILE $f"
    cat "$f"
  fi
done 2>/dev/null || true
echo "===== CERTBOT / SSL ====="
ls -la /etc/letsencrypt/live 2>/dev/null || echo "no letsencrypt live"
(command -v certbot && certbot certificates) 2>/dev/null || echo "no certbot"
echo "===== PROJECT DIRS ====="
ls -la /srv 2>/dev/null || echo "no /srv"
ls -la /var/www 2>/dev/null || echo "no /var/www"
ls -la /root 2>/dev/null | head -40
find /root /home /var/www /srv /opt -maxdepth 4 \( -name "package.json" -o -name "*.db" -o -name "prisma" -o -name "uploads" -o -name ".env" \) 2>/dev/null | head -100
echo "===== USERS ====="
getent passwd | grep -Ei "yaghoot|www|node|deploy" || true
echo "===== NETWORK OUTBOUND ====="
curl -I -m 10 https://registry.npmjs.org/ 2>&1 | head -8 || echo "npm registry fail"
curl -I -m 10 https://github.com/ 2>&1 | head -8 || echo "github fail"
echo "===== DONE ====="
