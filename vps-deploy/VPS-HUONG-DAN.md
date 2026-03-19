# 🚀 Deploy PaintCo lên VPS — Bản Chuẩn & Tối Giản

## 🖥️ Thông tin VPS

* OS: Ubuntu 22.04
* RAM: 2GB
* Domain: `nuocngavidai.duckdns.org`

---

# 🌐 BƯỚC 1 — Domain (DuckDNS)

👉 Dùng DuckDNS (đơn giản nhất)

1. Vào https://www.duckdns.org
2. Tạo subdomain:

```
nuocngavidai.duckdns.org
```

3. Nhập IP VPS → Save

✅ Xong

---

# 🔐 BƯỚC 2 — SSH vào VPS

```bash
ssh root@103.77.243.178
```

---

# ⚙️ BƯỚC 3 — Setup VPS (1 lần duy nhất)

```bash
bash /opt/paintco/vps-deploy/scripts/1-setup-vps.sh
```

Script sẽ cài:

* Docker
* Docker Compose
* Nginx
* Certbot
* Firewall
* Swap 2GB

---

# 📦 BƯỚC 4 — Clone project

```bash
cd /opt
git clone https://github.com/duykhanhdeveloper93/WebPainIO.git paintco
```

---

# 🔑 BƯỚC 5 — Cấu hình ENV

```bash
cd /opt/paintco
cp .env.example .env.production
nano .env.production
```

Sửa:

```env
NODE_ENV=production

DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=paintco
DB_PASSWORD=MatKhauManh123!
DB_DATABASE=paintco_db

JWT_SECRET=super_secret_key_very_long_123456

FRONTEND_URL=https://nuocngavidai.duckdns.org
```

---

# 🚀 BƯỚC 6 — Deploy

```bash
cd /opt/paintco
docker compose -f docker-compose.vps.yml up -d
```

---

# 🔐 BƯỚC 7 — Setup HTTPS (SSL)

```bash
bash vps-deploy/scripts/3-ssl.sh nuocngavidai.duckdns.org
```

👉 Script sẽ:

* xin SSL
* cấu hình nginx
* bật HTTPS

---

# ✅ KẾT QUẢ

```
https://nuocngavidai.duckdns.org
https://nuocngavidai.duckdns.org/api/v1
https://nuocngavidai.duckdns.org/api/docs
```

---

# 🔄 Update khi có code mới

```bash
cd /opt/paintco

git pull origin develop

docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d
```

---

# 📊 Commands quan trọng

```bash
# logs
docker compose -f docker-compose.vps.yml logs -f

# restart
docker compose -f docker-compose.vps.yml restart

# stop
docker compose -f docker-compose.vps.yml down

# tài nguyên
df -h
free -h
docker stats
```

---

# ⚡ Tối ưu VPS 2GB RAM

Thêm vào `.env.production`:

```env
NODE_OPTIONS=--max-old-space-size=512
```

---

# 🛠 Troubleshooting

### ❌ 502 Bad Gateway

```bash
docker compose logs backend
```

👉 backend chưa chạy

---

### ❌ SSL lỗi

* chạy lại:

```bash
bash vps-deploy/scripts/3-ssl.sh nuocngavidai.duckdns.org
```

---

### ❌ Domain không vào được

```bash
ping nuocngavidai.duckdns.org
```

👉 phải ra IP VPS

---

### ❌ Hết RAM

```bash
docker stats
```

👉 restart service:

```bash
docker compose restart backend
```

---

# 🧠 Kết luận

👉 Flow chuẩn:

```
Code → Git → VPS pull → Docker run → Nginx serve → HTTPS
```

👉 Ưu điểm:

* đơn giản
* dễ maintain
* đúng production

---
