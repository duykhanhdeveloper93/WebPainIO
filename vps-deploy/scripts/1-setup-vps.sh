#!/bin/bash
# PaintCo VPS Setup - Ubuntu 22.04 - Chay: sudo bash 1-setup-vps.sh
set -e
G='\033[0;32m'; B='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${G}[OK]${NC} $1"; }
step() { echo -e "${B}[..]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then echo "Chay voi sudo!"; exit 1; fi
echo -e "\n=== PaintCo VPS Setup ===\n"

step "1. Cap nhat system..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw fail2ban htop
ok "System updated"

step "2. Cai Docker..."
curl -fsSL https://get.docker.com | sh -s
systemctl enable docker && systemctl start docker
apt-get install -y -qq docker-compose-plugin
ok "Docker $(docker --version | cut -d' ' -f3)"

step "3. Cai Nginx..."
apt-get install -y -qq nginx
systemctl enable nginx && systemctl start nginx
ok "Nginx OK"

step "4. Cai Certbot (Let's Encrypt SSL)..."
apt-get install -y -qq snapd
snap install core 2>/dev/null || true
snap refresh core 2>/dev/null || true
snap install --classic certbot 2>/dev/null || apt-get install -y -qq certbot python3-certbot-nginx
ln -sf /snap/bin/certbot /usr/bin/certbot 2>/dev/null || true
ok "Certbot OK"

step "5. Firewall UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall OK"

step "6. Swap 2GB (quan trong cho 2GB RAM)..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile
  mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  ok "Swap 2GB OK"
else
  ok "Swap da co"
fi

step "7. Tao thu muc app..."
mkdir -p /opt/paintco
ok "/opt/paintco OK"

echo ""
echo "=== Setup xong! ==="
echo "Tiep theo: chay script 2-deploy.sh"
echo ""
