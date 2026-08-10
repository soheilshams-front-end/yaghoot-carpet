#!/bin/bash
set -euo pipefail

echo "==> Restore temporary nginx site so :80/:443 listen again"
ln -sfn /etc/nginx/sites-available/yaghootcarpet /etc/nginx/sites-enabled/yaghootcarpet
systemctl daemon-reload
nginx -t
systemctl reload nginx
ss -tlnp | grep -E ':80|:443' || true

echo "==> Apt update/upgrade"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

echo "==> Swap check (need >=2G for Next builds)"
# Current RAM is ~3.8G so swap not strictly required, but ensure at least 1G swap
SWAP_TOTAL_KB=$(awk '/SwapTotal/ {print $2}' /proc/meminfo)
if [ "${SWAP_TOTAL_KB:-0}" -lt 1048576 ]; then
  if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile || true
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free -h
swapon --show

echo "==> Install base packages"
apt-get install -y ufw fail2ban build-essential curl git sqlite3 ca-certificates gnupg

echo "==> Create yaghoot user"
if ! id yaghoot >/dev/null 2>&1; then
  adduser --disabled-password --gecos "Yaghoot App" yaghoot
fi
# Allow yaghoot to restart its own service later via sudoers
cat >/etc/sudoers.d/yaghoot <<'EOF'
yaghoot ALL=NOPASSWD: /bin/systemctl restart yaghoot, /bin/systemctl status yaghoot, /bin/systemctl is-active yaghoot
EOF
chmod 440 /etc/sudoers.d/yaghoot

echo "==> UFW"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo "==> fail2ban"
systemctl enable --now fail2ban
systemctl is-active fail2ban

echo "==> SSH hardening (keep key auth, disable password)"
SSHD=/etc/ssh/sshd_config
cp -a "$SSHD" "${SSHD}.bak.$(date +%Y%m%d%H%M%S)"
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' "$SSHD"
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' "$SSHD"
sshd -t
systemctl reload ssh || systemctl reload sshd || true

echo "==> HARDENING DONE"
free -h
id yaghoot
node -v
npm -v
nginx -v
certbot --version || true
