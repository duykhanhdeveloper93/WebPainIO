#!/bin/bash
# Script này chạy TRÊN VPS, được Jenkins SSH vào gọi
# Không chạy tay - Jenkins gọi tự động
set -e

BUILD_TAG=${1:-latest}
APP_DIR="/opt/paintco"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.vps.yml"
ENV_FILE="${APP_DIR}/.env.production"

echo "=== CI Deploy | Build: ${BUILD_TAG} | $(date) ==="

cd $APP_DIR

# Kiểm tra file .env.production
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Chua co $ENV_FILE"
  echo "Chay: cp .env.production.example .env.production va sua gia tri"
  exit 1
fi

# Build images mới
echo "[1/4] Building Docker images..."
$COMPOSE --env-file $ENV_FILE build --no-cache

# Rolling restart (zero-downtime)
echo "[2/4] Restarting services..."
$COMPOSE --env-file $ENV_FILE up -d --remove-orphans

# Wait MySQL healthy
echo "[3/4] Waiting for MySQL..."
sleep 10
RETRY=0
until $COMPOSE exec -T mysql mysqladmin ping --silent 2>/dev/null; do
  RETRY=$((RETRY+1))
  [ $RETRY -gt 15 ] && break
  sleep 3
done

# Chỉ seed lần đầu
SEEDED="/opt/paintco/.seeded"
if [ ! -f "$SEEDED" ]; then
  echo "[4/4] Seeding database (first time)..."
  sleep 5
  $COMPOSE exec -T backend node dist/database/seed.js && touch "$SEEDED"
else
  echo "[4/4] Database already seeded, skipping"
fi

# Reload nginx
nginx -t && systemctl reload nginx

echo "=== Deploy OK | Build: ${BUILD_TAG} ==="
$COMPOSE ps
