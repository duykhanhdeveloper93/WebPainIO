#!/bin/bash
# PaintCo — Quick Start Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${RED}🎨  PaintCo Vietnam — Quick Start${NC}"
echo "=================================="
echo ""

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker chưa cài. Tải tại: https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker chưa chạy. Hãy mở Docker Desktop trước.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker OK${NC}"
echo ""
echo -e "${BLUE}🔨 Building tất cả services... (lần đầu 5-10 phút)${NC}"
echo ""

docker-compose up -d --build

echo ""
echo -e "${BLUE}⏳ Đợi MySQL + Backend sẵn sàng (60 giây)...${NC}"
sleep 60

echo -e "${BLUE}🌱 Seed dữ liệu mẫu...${NC}"
docker-compose exec -T backend node dist/database/seed.js 2>/dev/null \
  && echo -e "${GREEN}✅ Seed OK${NC}" \
  || echo -e "${YELLOW}⚠️  Seed thủ công: docker-compose exec backend node dist/database/seed.js${NC}"

echo ""
echo -e "${GREEN}🎉 PaintCo sẵn sàng!${NC}"
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  🌐  Website:  http://localhost             │"
echo "│  📚  Swagger:  http://localhost:3000/api/docs│"
echo "│  👤  Admin:    admin@paintco.vn / admin123  │"
echo "└─────────────────────────────────────────────┘"
echo ""
echo -e "${YELLOW}Logs: docker-compose logs -f   |   Tắt: docker-compose down${NC}"
echo ""
