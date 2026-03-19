
pipeline {
    agent any

    environment {
        APP_DIR = '/opt/paintco'     // 📂 Thư mục deploy trên VPS
        GIT_BRANCH = 'develop'      // 🌿 Branch cần deploy
    }

    triggers {
        githubPush()                // 🚀 Auto deploy khi push code
    }

    stages {

        stage('📥 Checkout Code') {
            steps {
                // 📥 Lấy code từ GitHub
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/duykhanhdeveloper93/WebPainIO.git'
                    ]]
                ])
            }
        }

        stage('📦 Deploy to VPS') {
            steps {
                sh '''
                    echo "📂 Ensure app directory exists..."
                    mkdir -p $APP_DIR

                    echo "🔄 Sync code (không xoá file quan trọng)..."
                    # rsync giúp:
                    # - update code
                    # - giữ lại .env, certbot, uploads
                    rsync -av --delete \
                      --exclude='.env.production' \
                      --exclude='certbot' \
                      --exclude='uploads' \
                      ./ "$APP_DIR"/

                    cd "$APP_DIR"

                    echo "🛑 Stop old containers..."
                    docker compose -f docker-compose.vps.yml down

                    echo "📥 Pull latest images từ Docker Hub..."
                    # ⚠️ Không build tại VPS nữa (chuẩn DevOps)
                    docker compose -f docker-compose.vps.yml pull

                    echo "🚀 Start containers..."
                    docker compose -f docker-compose.vps.yml up -d --remove-orphans

                    echo "🧹 Cleanup Docker rác..."
                    docker image prune -af
                '''
            }
        }

        stage('❤️ Health Check') {
            steps {
                script {
                    echo "⏳ Waiting for app (retry)..."

                    // 🔁 Retry 10 lần (mỗi lần cách 5s)
                    def success = false
                    for (int i = 1; i <= 10; i++) {

                        def status = sh(
                            script: """
                            curl -k -s -o /dev/null -w '%{http_code}' https://nuocngavidai.duckdns.org/api/v1/products || echo '000'
                            """,
                            returnStdout: true
                        ).trim()

                        echo "🔍 Try ${i}: HTTP ${status}"

                        if (status == '200') {
                            success = true
                            break
                        }

                        sleep 5
                    }

                    // ❌ Fail nếu không lên được
                    if (!success) {
                        error("❌ App failed after retries!")
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ DEPLOY SUCCESS - App is live 🚀"
        }
        failure {
            echo "❌ DEPLOY FAILED - Check logs ngay!"
        }
    }
}

