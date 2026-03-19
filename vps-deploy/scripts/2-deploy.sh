#!/bin/bash
# PaintCo Deploy Script
# Chay: bash 2-deploy.sh
# Truoc khi chay: copy thu muc paintco/ vao /opt/paintco/
set -e
G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${G}[OK]${NC} $1"; }
step() { echo -e "${B}[..]${NC} $1"; }
warn() { echo -e "${Y}[!!]${NC} $1"; }

APP_DIR="/opt/paintco"

if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
  echo "Khong tim thay $APP_DIR/docker-compose.yml"
  echo "Copy code truoc: scp -r ./paintco/ user@VPS_IP:/opt/"
  exit 1
fi

cd $APP_DIR
echo -e "\n=== Deploy PaintCo ===\n"

# Tao file .env.production neu chua co
if [ ! -f ".env.production" ]; then
  warn "Chua co .env.production, tao mau..."
  cat > .env.production << 'ENVEOF'
NODE_ENV=production
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=paintco
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
DB_DATABASE=paintco_db
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHARS
JWT_EXPIRES=7d
FRONTEND_URL=https://YOURDOMAIN.COM
ENVEOF
  warn "QUAN TRONG: Sua file .env.production truoc khi tiep tuc!"
  warn "nano /opt/paintco/.env.production"
  exit 0
fi

step "1. Pull images / build..."
docker compose -f docker-compose.yml --env-file .env.production pull 2>/dev/null || true
docker compose -f docker-compose.yml --env-file .env.production up -d --build
ok "Containers started"

step "2. Doi MySQL san sang..."
sleep 15
RETRIES=0
until docker compose exec -T mysql mysqladmin ping -u paintco -pCHANGE_THIS_STRONG_PASSWORD --silent 2>/dev/null; do
  RETRIES=$((RETRIES+1))
  if [ $RETRIES -gt 20 ]; then warn "MySQL chua ready, bo qua..."; break; fi
  echo -n "." && sleep 3
done
echo ""
ok "MySQL ready"

step "3. Seed du lieu mau (lan dau)..."
SEEDED_FLAG="$APP_DIR/.seeded"
if [ ! -f "$SEEDED_FLAG" ]; then
  docker compose exec -T backend node dist/database/seed.js && touch "$SEEDED_FLAG"
  ok "Seed OK"
else
  warn "Da seed truoc do, bo qua"
fi

step "4. Kiem tra services..."
docker compose ps

echo ""
echo "=== Deploy xong! ==="
echo "Tiep theo: bash 3-ssl.sh yourdomain.com"
echo ""
