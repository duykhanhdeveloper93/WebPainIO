🚀 Jenkins Setup — PaintCo (Simple & Clean Version)
VPS

IP: 103.77.243.178

Domain: nuocngavidai.duckdns.org

Repo: https://github.com/duykhanhdeveloper93/WebPainIO.git

Branch: develop

🧩 BƯỚC 1 — Cài Jenkins
ssh root@103.77.243.178

# Cài Jenkins
bash /opt/paintco/vps-deploy/scripts/0-install-jenkins.sh

Lấy mật khẩu:

cat /var/lib/jenkins/secrets/initialAdminPassword
🌐 BƯỚC 2 — Truy cập Jenkins

👉 http://103.77.243.178:8080

Install suggested plugins

Tạo user admin

🔌 BƯỚC 3 — Plugins cần thiết

Cài:

GitHub Integration

Timestamper

👉 Không cần:

SSH Agent ❌

NodeJS ❌

Docker Pipeline ❌ (vì không build ở Jenkins)

⚙️ BƯỚC 4 — Tạo Pipeline Job

New Item → Pipeline

Config:

GitHub project: repo của mày

Build trigger:

✅ GitHub hook trigger

Pipeline:

Definition: Pipeline script from SCM

Repo:
https://github.com/duykhanhdeveloper93/WebPainIO.git

Branch: */develop

Script path: Jenkinsfile

🔗 BƯỚC 5 — Setup GitHub Webhook

GitHub → Settings → Webhooks:

URL:

http://103.77.243.178:8080/github-webhook/

Event: Push

🚀 BƯỚC 6 — Flow Deploy
Push code → GitHub
        ↓
Webhook → Jenkins
        ↓
Jenkins:
   1. Pull code về VPS
   2. docker compose pull
   3. docker compose up -d
   4. Health check

👉 Không dùng:

rsync ❌

build tại VPS ❌

script deploy riêng ❌

📦 BƯỚC 7 — Chuẩn bị VPS (1 lần)
cd /opt
git clone https://github.com/duykhanhdeveloper93/WebPainIO.git paintco

Tạo env:

cp /opt/paintco/.env.example /opt/paintco/.env.production
nano /opt/paintco/.env.production
🔐 BƯỚC 8 — SSL (HTTPS)
bash /opt/paintco/vps-deploy/scripts/3-ssl.sh nuocngavidai.duckdns.org
❤️ BƯỚC 9 — Health Check

API:

https://nuocngavidai.duckdns.org/api/v1/products
🛠 Useful Commands
# logs
docker compose -f /opt/paintco/docker-compose.vps.yml logs -f

# restart
docker compose -f /opt/paintco/docker-compose.vps.yml restart

# stop
docker compose -f /opt/paintco/docker-compose.vps.yml down

# disk
df -h

# RAM
free -h
⚠️ Troubleshoot
Jenkins không trigger

Check webhook GitHub

502 Bad Gateway

Backend chưa chạy

SSL lỗi

Chưa chạy script SSL hoặc domain sai