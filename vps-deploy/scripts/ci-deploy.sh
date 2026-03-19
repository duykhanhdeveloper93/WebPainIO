#!/bin/bash

set -e

APP_DIR="/opt/paintco"

echo "📂 Move to app dir..."
cd $APP_DIR

echo "🧹 Stop old containers..."
docker compose -f docker-compose.vps.yml down

echo "🔨 Build new containers..."
docker compose -f docker-compose.vps.yml build --no-cache

echo "🚀 Start new containers..."
docker compose -f docker-compose.vps.yml up -d

echo "🧼 Clean unused images..."
docker image prune -f

echo "✅ Deploy SUCCESS!"