#!/bin/bash
# Setup SSL + Nginx cho PaintCo
# Usage: bash 3-ssl.sh paintco.duckdns.org your@email.com
set -e
G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; Y='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${G}[OK]${NC} $1"; }
step() { echo -e "${B}[..]${NC} $1"; }
err()  { echo -e "${R}[ERR]${NC} $1"; exit 1; }
warn() { echo -e "${Y}[!!]${NC} $1"; }

DOMAIN=$1
EMAIL=${2:-"admin@${1}"}
APP_DIR="/opt/paintco"

[ -z "$DOMAIN" ] && { echo "Usage: bash 3-ssl.sh yourdomain.com"; exit 1; }
[ "$EUID" -ne 0 ] && { echo "Chay voi sudo!"; exit 1; }

echo "=== SSL Setup: $DOMAIN ==="

# 1. Check domain tro dung IP
step "1. Kiem tra domain $DOMAIN..."
VPS_IP=$(curl -4 -s ifconfig.me 2>/dev/null || echo "unknown")
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | tail -1 || echo "unresolved")
echo "  VPS IP:    $VPS_IP"
echo "  Domain IP: $DOMAIN_IP"
if [ "$DOMAIN_IP" != "$VPS_IP" ]; then
  warn "Domain chua tro ve VPS!"
  warn "Them A record: $DOMAIN -> $VPS_IP"
  warn "Roi chay lai script nay (co the mat 5-30 phut de DNS propagate)"
  # Khong exit de co the test local
fi

# 2. Copy + cau hinh nginx
step "2. Cau hinh Nginx..."
cp ${APP_DIR}/vps-deploy/nginx/paintco.conf /etc/nginx/sites-available/paintco
sed -i "s/DOMAIN_HERE/${DOMAIN}/g" /etc/nginx/sites-available/paintco
ln -sf /etc/nginx/sites-available/paintco /etc/nginx/sites-enabled/paintco
rm -f /etc/nginx/sites-enabled/default

# Test truoc khi apply (dung cert gia)
sed -i 's|ssl_certificate|#ssl_certificate|g' /etc/nginx/sites-available/paintco
sed -i 's|ssl_dhparam|#ssl_dhparam|g' /etc/nginx/sites-available/paintco
sed -i 's|include /etc/letsencrypt|#include /etc/letsencrypt|g' /etc/nginx/sites-available/paintco
nginx -t || err "Nginx config loi"

# Khoi phuc SSL lines (se duoc Certbot xu ly)
sed -i 's|#ssl_certificate|ssl_certificate|g' /etc/nginx/sites-available/paintco
sed -i 's|#ssl_dhparam|ssl_dhparam|g' /etc/nginx/sites-available/paintco
sed -i 's|#include /etc/letsencrypt|include /etc/letsencrypt|g' /etc/nginx/sites-available/paintco

# Tam thoi dung server HTTP cho Certbot
cat > /etc/nginx/sites-available/paintco-temp << TEMPEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN jenkins.$DOMAIN;
    root /var/www/html;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 200 "PaintCo OK"; }
}
TEMPEOF
ln -sf /etc/nginx/sites-available/paintco-temp /etc/nginx/sites-enabled/paintco-temp
rm -f /etc/nginx/sites-enabled/paintco
nginx -t && systemctl reload nginx
ok "Nginx temp config OK"

# 3. Lay SSL cert
step "3. Xin SSL certificate tu Let's Encrypt..."
certbot certonly \
  --nginx \
  -d ${DOMAIN} \
  -d www.${DOMAIN} \
  -d jenkins.${DOMAIN} \
  --non-interactive \
  --agree-tos \
  -m ${EMAIL} \
  --keep-until-expiring
ok "SSL cert OK"

# 4. Dung config that
rm -f /etc/nginx/sites-enabled/paintco-temp
ln -sf /etc/nginx/sites-available/paintco /etc/nginx/sites-enabled/paintco
nginx -t && systemctl reload nginx
ok "Nginx HTTPS config active"

# 5. Auto renew
step "4. Setup tu dong gia han SSL..."
(crontab -l 2>/dev/null | grep -v certbot; echo "0 3 1,15 * * certbot renew --quiet && systemctl reload nginx") | crontab -
ok "Auto-renew: ngay 1 va 15 hang thang"

echo ""
echo "========================================================="
echo "  Website: https://${DOMAIN}"
echo "  API:     https://${DOMAIN}/api/v1"
echo "  Admin:   https://${DOMAIN}/admin"
echo "  Jenkins: https://jenkins.${DOMAIN}"
echo ""
echo "  Admin login: admin@paintco.vn / admin123"
echo "========================================================="
