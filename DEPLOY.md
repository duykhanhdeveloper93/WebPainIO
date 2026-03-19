# 🚀 Deploy PaintCo lên Render.com (Free)

## Chuẩn bị

### 1. Push lên GitHub
```bash
cd paintco
git init
git add .
git commit -m "PaintCo v1.0"
# Tạo repo mới trên github.com
git remote add origin https://github.com/USERNAME/paintco.git
git push -u origin main
```

### 2. Tạo MySQL free trên PlanetScale
1. Vào https://planetscale.com → Sign up (free, không cần thẻ)
2. New database → tên: `paintco-db`, region: `ap-southeast`
3. Vào **Connect** → chọn **Connect with: Node.js**
4. Copy thông tin: host, username, password

## Deploy Backend (Render Web Service)

1. Vào https://render.com → **New +** → **Web Service**
2. Connect GitHub repo
3. Cài đặt:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main`
   - **Instance**: Free

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<từ PlanetScale>
   DB_PORT=3306
   DB_USERNAME=<từ PlanetScale>
   DB_PASSWORD=<từ PlanetScale>
   DB_DATABASE=paintco-db
   JWT_SECRET=<tạo chuỗi ngẫu nhiên>
   FRONTEND_URL=https://<tên-frontend>.onrender.com
   ```

5. Deploy → lấy URL: `https://paintco-backend-xxx.onrender.com`

6. **Seed database** (1 lần duy nhất):
   - Vào Render dashboard → backend service → **Shell**
   - Chạy: `node dist/database/seed.js`

## Deploy Frontend (Render Static Site)

1. **New +** → **Static Site**
2. Connect cùng GitHub repo
3. Cài đặt:
   - **Root Directory**: `frontend`
   - **Build Command**: `BACKEND_URL=https://paintco-backend-xxx.onrender.com sh build-render.sh`
   - **Publish Directory**: `dist/paintco-frontend/browser`

4. **Redirect/Rewrite Rules**:
   - Source: `/*` → Destination: `/index.html` → Type: **Rewrite**

5. Deploy → sẽ có URL: `https://paintco-frontend-xxx.onrender.com`

## Domain miễn phí

Render tự cấp domain `*.onrender.com` với HTTPS tự động.

Muốn domain đẹp hơn:
- **Freenom.com**: `.tk`, `.ml`, `.ga` miễn phí
- **js.org**: `paintco.js.org` (cho projects GitHub)
- Sau đó vào Render → Custom Domain → nhập domain → cập nhật DNS

## Sau khi deploy

- 🌐 Website: `https://paintco-frontend-xxx.onrender.com`
- 📡 API: `https://paintco-backend-xxx.onrender.com/api/v1`
- 📚 Swagger: `https://paintco-backend-xxx.onrender.com/api/docs`
- 👤 Admin: `/admin` → `admin@paintco.vn` / `admin123`

## Lưu ý Free Tier

- Backend ngủ sau 15 phút không có request → lần đầu vào sẽ chậm ~30 giây
- 750 giờ/tháng → đủ dùng cho 1 service suốt tháng
- Muốn backend luôn online: dùng UptimeRobot.com ping mỗi 5 phút (miễn phí)
