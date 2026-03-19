# Jenkins Setup — PaintCo CI/CD
## VPS: 103.77.243.178
## Repo: https://github.com/duykhanhdeveloper93/WebPainIO.git
## Branch: develop

---

## BƯỚC 1 — Cài Jenkins lên VPS

```bash
# SSH vào VPS
ssh root@103.77.243.178

# Cài Jenkins (và Java, NodeJS)
bash /opt/paintco/vps-deploy/scripts/0-install-jenkins.sh
```

Sau khi xong, lấy mật khẩu admin:
```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## BƯỚC 2 — Mở Jenkins lần đầu

Truy cập: **http://103.77.243.178:8080**

1. Nhập mật khẩu admin ban đầu
2. Chọn **"Install suggested plugins"** → đợi cài xong
3. Tạo admin user:
   - Username: `admin`
   - Password: `MK_MANH_CUA_MAY`
   - Email: `admin@paintco.vn`
4. Jenkins URL: `http://103.77.243.178:8080`
5. **Save and Finish**

---

## BƯỚC 3 — Cài thêm Plugins cần thiết

**Manage Jenkins → Plugins → Available**

Tìm và cài:
- ✅ `Docker Pipeline`
- ✅ `Docker Commons`
- ✅ `SSH Agent`
- ✅ `NodeJS`
- ✅ `GitHub Integration`
- ✅ `Workspace Cleanup`
- ✅ `Timestamper`

→ Restart Jenkins sau khi cài

---

## BƯỚC 4 — Cấu hình Credentials

**Manage Jenkins → Credentials → System → Global credentials → Add**

### Credential 1: SSH key vào VPS
- Kind: **SSH Username with private key**
- ID: `vps-deploy-ssh`
- Username: `root`
- Private Key: **Enter directly** → paste nội dung SSH private key của mày

> Tạo SSH key nếu chưa có:
> ```bash
> ssh-keygen -t ed25519 -C "jenkins@paintco" -f ~/.ssh/jenkins_deploy
> cat ~/.ssh/jenkins_deploy      # paste vào Jenkins (private key)
> cat ~/.ssh/jenkins_deploy.pub  # thêm vào VPS: echo "..." >> ~/.ssh/authorized_keys
> ```

### Credential 2: GitHub (nếu repo private)
- Kind: **Username with password**
- ID: `github-credentials`
- Username: `duykhanhdeveloper93`
- Password: GitHub Personal Access Token (tạo tại github.com/settings/tokens)

---

## BƯỚC 5 — Cấu hình NodeJS tool

**Manage Jenkins → Tools → NodeJS → Add NodeJS**

- Name: `NodeJS-20`
- Version: `NodeJS 20.x`
- ✅ Install automatically

---

## BƯỚC 6 — Tạo Pipeline Job

**New Item → Tên: `paintco-pipeline` → Pipeline → OK**

### General:
- ✅ GitHub project: `https://github.com/duykhanhdeveloper93/WebPainIO`
- ✅ Discard old builds: Keep 10 builds

### Build Triggers:
- ✅ **GitHub hook trigger for GITScm polling** (tự build khi push)

### Pipeline:
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/duykhanhdeveloper93/WebPainIO.git`
- Branch: `*/develop`
- Script Path: `Jenkinsfile`

→ **Save**

---

## BƯỚC 7 — Setup GitHub Webhook

Trên GitHub repo `WebPainIO`:
**Settings → Webhooks → Add webhook**

- Payload URL: `http://103.77.243.178:8080/github-webhook/`
- Content type: `application/json`
- ✅ Just the push event
- ✅ Active

→ **Add webhook**

Kiểm tra: Push code lên nhánh `develop` → Jenkins tự build!

---

## BƯỚC 8 — Setup HTTPS cho Jenkins (optional nhưng nên làm)

Sau khi có domain (ví dụ `paintco.duckdns.org`):

```bash
# Jenkins sẽ chạy tại https://jenkins.paintco.duckdns.org
# Script 3-ssl.sh đã tự config sẵn jenkins.DOMAIN
bash /opt/paintco/vps-deploy/scripts/3-ssl.sh paintco.duckdns.org
```

Sau đó update Jenkins URL:
- **Manage Jenkins → System → Jenkins URL**
- Đổi thành: `https://jenkins.paintco.duckdns.org`
- Đóng port 8080: `ufw delete allow 8080/tcp`

---

## Flow CI/CD hoàn chỉnh

```
Developer push code
  → nhánh: develop
  → GitHub nhận push
  → GitHub gọi Webhook → Jenkins
  → Jenkins chạy Jenkinsfile:
      Stage 1: Checkout code
      Stage 2: Test backend (npm test)
      Stage 3: Test frontend (npm lint)
      Stage 4: Build Docker images (parallel)
      Stage 5: rsync code → VPS 103.77.243.178
              SSH → ci-deploy.sh → docker compose up
      Stage 6: Health check API
      Stage 7: Cleanup images cũ
  → Thông báo SUCCESS/FAILED
```

---

## Xem Build logs

```bash
# Trên VPS, xem log real-time:
docker compose -f /opt/paintco/docker-compose.vps.yml logs -f

# Xem log 1 service:
docker compose -f /opt/paintco/docker-compose.vps.yml logs -f backend

# Jenkins logs:
journalctl -u jenkins -f
```

---

## Troubleshoot thường gặp

**Jenkins không build tự động:**
- Kiểm tra Webhook: GitHub → Settings → Webhooks → Recent Deliveries
- Jenkins phải accessible từ internet (port 8080 hoặc qua nginx)

**SSH permission denied:**
```bash
# Thêm Jenkins public key vào VPS
echo "$(cat ~/.ssh/jenkins_deploy.pub)" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

**Docker build chậm:**
```bash
# Xem disk còn trống không
df -h /var/lib/docker
# Dọn images cũ
docker system prune -f
```

**Out of memory khi build:**
```bash
# Kiểm tra RAM
free -h
# Nếu swap chưa có:
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
```
