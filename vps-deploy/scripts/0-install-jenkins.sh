#!/bin/bash
# Cai Jenkins tren VPS Ubuntu 22.04
# Chay: sudo bash 0-install-jenkins.sh
set -e
G='\033[0;32m'; B='\033[0;34m'; Y='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${G}[OK]${NC} $1"; }
step() { echo -e "${B}[..]${NC} $1"; }
warn() { echo -e "${Y}[!!]${NC} $1"; }

echo "=== Cai Jenkins tren Ubuntu 22.04 ==="
if [ "$EUID" -ne 0 ]; then echo "Chay voi sudo!"; exit 1; fi

# 1. Java 17 (Jenkins can Java)
step "1. Cai Java 17..."
apt-get update -qq
apt-get install -y -qq fontconfig openjdk-17-jre
java -version
ok "Java OK"

# 2. Jenkins
step "2. Cai Jenkins..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
  | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" \
  | tee /etc/apt/sources.list.d/jenkins.list > /dev/null

apt-get update -qq
apt-get install -y -qq jenkins
systemctl enable jenkins
systemctl start jenkins
ok "Jenkins installed"

# 3. Them jenkins user vao docker group
usermod -aG docker jenkins
ok "Jenkins added to docker group"

# 4. Cai NodeJS (de chay npm tren Jenkins agent)
step "3. Cai NodeJS 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs
node --version && npm --version
ok "NodeJS OK"

# 5. Firewall cho Jenkins port 8080
step "4. Mo port Jenkins 8080 (tam thoi)..."
ufw allow 8080/tcp
ok "Port 8080 open"

# 6. Nginx proxy cho Jenkins (de dung HTTPS)
step "5. Cau hinh Nginx proxy Jenkins..."
cat > /etc/nginx/sites-available/jenkins << 'NGINXEOF'
server {
    listen 80;
    server_name jenkins.103.77.243.178.nip.io;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Quan trong cho Jenkins
        proxy_read_timeout 90;
        proxy_redirect http://127.0.0.1:8080 https://jenkins.103.77.243.178.nip.io;
    }
}
NGINXEOF
ln -sf /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/jenkins
nginx -t && systemctl reload nginx
ok "Nginx proxy OK"

# 7. In mat khau ban dau
echo ""
echo "=================================="
echo "Jenkins da cai xong!"
echo ""
echo "Mat khau admin ban dau:"
echo "$(cat /var/lib/jenkins/secrets/initialAdminPassword)"
echo ""
echo "Truy cap Jenkins:"
echo "  http://103.77.243.178:8080"
echo "  hoac: http://jenkins.103.77.243.178.nip.io"
echo ""
warn "Sau khi setup xong, dong port 8080:"
warn "  ufw delete allow 8080/tcp"
echo "=================================="
