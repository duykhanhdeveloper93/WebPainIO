pipeline {
    agent any

    environment {
        APP_DIR = '/opt/paintco'
        GIT_BRANCH = 'develop'
    }

    triggers {
        githubPush()
    }

    stages {

        stage('📥 Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/duykhanhdeveloper93/WebPainIO.git'
                    ]]
                ])
            }
        }

        stage('📦 Deploy Local VPS') {
            steps {
                sh '''
                    echo "📂 Check directory..."
                    if [ ! -d "$APP_DIR" ]; then
                        echo "➡️ Creating $APP_DIR"
                        mkdir -p "$APP_DIR"
                    else
                        echo "➡️ Directory exists"
                    fi

                    echo "🧹 Clean old code..."
                    rm -rf "$APP_DIR"/*

                    echo "📦 Copy new code..."
                    cp -r * "$APP_DIR"/

                    cd "$APP_DIR"

                    echo "🛑 Stop containers..."
                    docker compose -f docker-compose.vps.yml down

                    echo "🔨 Build..."
                    docker compose -f docker-compose.vps.yml build --no-cache

                    echo "🚀 Start..."
                    docker compose -f docker-compose.vps.yml up -d
                '''
            }
        }

        stage('❤️ Health Check') {
            steps {
                script {
                    echo "⏳ Waiting for app..."
                    sleep 20

                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/products || echo '000'",
                        returnStdout: true
                    ).trim()

                    echo "Health: ${status}"

                    if (status != '200') {
                        error("❌ App failed!")
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ DEPLOY SUCCESS"
        }
        failure {
            echo "❌ DEPLOY FAILED"
        }
    }
}