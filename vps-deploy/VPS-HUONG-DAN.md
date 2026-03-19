# 🚀 Deploy PaintCo lên VPS — Hướng dẫn đầy đủ

## Thông tin VPS
- OS: Ubuntu 22.04 LTS
- RAM: 2GB | SSD: 30GB
- Giá: ~120k/tháng (360k/3 tháng)

---

## BƯỚC 1 — Lấy domain free

### Option A: Freenom (miễn phí 1 năm)
1. Vào https://www.freenom.com
2. Tìm tên → chọn `.tk` hoặc `.ml` hoặc `.ga`
3. Đăng ký miễn phí 12 tháng
4. **Quan trọng**: Gia hạn trước ngày hết hạn (miễn phí tiếp)

### Option B: duckdns.org (miễn phí vĩnh viễn — đơn giản nhất)
1. Vào https://www.duckdns.org
2. Đăng nhập GitHub/Google
3. Tạo subdomain: `paintco-xyz.duckdns.org`
4. Nhập IP VPS → Save
→ **Có ngay domain miễn phí vĩnh viễn!**

### Option C: is-a.dev (dành cho developers)
1. Fork repo https://github.com/is-a-dev/register
2. Tạo file `paintco.json` trong `domains/`
3. Mở Pull Request → được duyệt trong vài giờ
→ Domain: `paintco.is-a.dev`

**Khuyên dùng**: duckdns.org — nhanh nhất, không cần thẻ, vĩnh viễn

---

## BƯỚC 2 — SSH vào VPS

```bash
# Từ máy tính của mày (Windows: dùng PuTTY hoặc Windows Terminal)
ssh root@IP_VPS_CUA_MAY
# Ví dụ:
ssh root@103.123.45.67
```

---

## BƯỚC 3 — Setup VPS (1 lần duy nhất)

```bash
# Trên VPS, chạy:
curl -fsSL https://raw.githubusercontent.com/TEN_MAY/paintco/main/vps-deploy/scripts/1-setup-vps.sh | bash

# Hoặc upload script rồi chạy:
bash /opt/paintco/vps-deploy/scripts/1-setup-vps.sh
```

Script này sẽ cài:
- Docker + Docker Compose
- Nginx
- Certbot (Let's Encrypt)
- UFW Firewall
- Swap 2GB (quan trọng!)

---

## BƯỚC 4 — Upload code lên VPS

### Cách 1: SCP từ máy tính (đơn giản nhất)
```bash
# Chạy trên máy tính của mày, không phải VPS
scp -r ./paintco/ root@IP_VPS:/opt/
```

### Cách 2: Git (nếu code trên GitHub)
```bash
# Trên VPS:
cd /opt
git clone https://github.com/TEN_MAY/paintco.git paintco
```

### Cách 3: Filezilla (giao diện đồ họa, dễ nhất)
- Download FileZilla: https://filezilla-project.org
- Host: IP_VPS | User: root | Port: 22
- Kéo thả thư mục paintco/ vào /opt/

---

## BƯỚC 5 — Cấu hình .env.production

```bash
# Trên VPS:
cp /opt/paintco/.env.example /opt/paintco/.env.production
nano /opt/paintco/.env.production
```

Sửa các giá trị:
```env
NODE_ENV=production
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=paintco
DB_PASSWORD=MatKhauManhVaoDayVD@2024!
DB_DATABASE=paintco_db
JWT_SECRET=ChuoiNgauNhienDaiItnhat64KyTuVDxK9mP2qR7vL
JWT_EXPIRES=7d
FRONTEND_URL=https://paintco-xyz.duckdns.org
```

---

## BƯỚC 6 — Deploy

```bash
cd /opt/paintco
bash vps-deploy/scripts/2-deploy.sh
```

---

## BƯỚC 7 — Trỏ domain về VPS

### Nếu dùng DuckDNS:
- Vào duckdns.org → nhập IP VPS → Update

### Nếu dùng Freenom:
- Vào Freenom → My Domains → Manage → DNS Management
- Thêm A Record: `@` → IP_VPS
- Thêm A Record: `www` → IP_VPS

### Kiểm tra đã trỏ chưa:
```bash
ping paintco-xyz.duckdns.org
# Phải ra IP của VPS mày
```

---

## BƯỚC 8 — Cấu hình HTTPS (SSL)

```bash
# Thay yourdomain.com bằng domain của mày
bash /opt/paintco/vps-deploy/scripts/3-ssl.sh paintco-xyz.duckdns.org
```

Script tự động:
- Copy nginx config
- Xin cert SSL từ Let's Encrypt
- Setup auto-renew mỗi 3 tháng
- Redirect HTTP → HTTPS

---

## KẾT QUẢ

```
https://paintco-xyz.duckdns.org          → Website
https://paintco-xyz.duckdns.org/api/v1   → API
https://paintco-xyz.duckdns.org/api/docs → Swagger
https://paintco-xyz.duckdns.org/admin    → Admin
```

Admin login: `admin@paintco.vn` / `admin123`

---

## Quản lý sau khi deploy

```bash
# Xem logs
docker compose -f /opt/paintco/docker-compose.vps.yml logs -f

# Xem logs 1 service
docker compose -f /opt/paintco/docker-compose.vps.yml logs -f backend

# Restart 1 service
docker compose -f /opt/paintco/docker-compose.vps.yml restart backend

# Tắt tất cả
docker compose -f /opt/paintco/docker-compose.vps.yml down

# Update code mới
cd /opt/paintco && bash vps-deploy/scripts/4-update.sh

# Xem dung lượng disk
df -h

# Xem RAM
free -h

# Xem CPU
htop
```

---

## Tối ưu cho VPS 2GB RAM

File `/opt/paintco/.env.production` thêm:
```env
# Giới hạn Node.js heap size
NODE_OPTIONS=--max-old-space-size=512
```

File `/opt/paintco/docker-compose.vps.yml`, thêm vào mỗi service:
```yaml
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Troubleshooting

**Backend không start:**
```bash
docker compose -f docker-compose.vps.yml logs backend
```

**MySQL lỗi:**
```bash
docker compose -f docker-compose.vps.yml exec mysql mysql -u root -p
```

**SSL lỗi "too many requests":**
- Let's Encrypt giới hạn 5 lần/giờ cho 1 domain
- Đợi 1 tiếng rồi thử lại

**Hết RAM:**
```bash
# Xem process nào ngốn RAM
docker stats
# Restart service cụ thể
docker compose -f docker-compose.vps.yml restart backend
```
