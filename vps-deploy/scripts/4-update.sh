#!/bin/bash
# PaintCo Update Script - khi co code moi
# Chay: bash 4-update.sh
set -e
cd /opt/paintco
echo "=== Updating PaintCo ==="

git pull origin main

echo "Rebuilding containers..."
docker compose up -d --build --remove-orphans

echo "Cleaning old images..."
docker image prune -f

echo ""
echo "=== Update xong! ==="
docker compose ps
