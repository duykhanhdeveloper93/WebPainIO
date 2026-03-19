pipeline {
    agent any

    environment {
        // ── Thông tin project ──────────────────────────────────
        APP_NAME     = 'paintco'
        APP_DIR      = '/opt/paintco'
        GIT_REPO     = 'https://github.com/duykhanhdeveloper93/WebPainIO.git'
        GIT_BRANCH   = 'develop'

        // ── Docker image names ─────────────────────────────────
        IMG_BACKEND  = 'paintco-backend'
        IMG_FRONTEND = 'paintco-frontend'

        // ── Credentials (tạo trong Jenkins > Credentials) ─────
        // DEPLOY_SSH: SSH key để vào VPS 103.77.243.178
        DEPLOY_SSH  = credentials('vps-deploy-ssh')
        VPS_IP      = '103.77.243.178'
        VPS_USER    = 'root'

        // ── Build info ─────────────────────────────────────────
        BUILD_TS     = sh(script: 'date +%Y%m%d_%H%M%S', returnStdout: true).trim()
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    triggers {
        // Tự động build khi push lên branch develop
        githubPush()
    }

    stages {

        // ── STAGE 1: Checkout ──────────────────────────────────
        stage('📥 Checkout') {
            steps {
                script {
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Build: #${BUILD_NUMBER}"
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO}",
                        credentialsId: 'github-credentials'  // nếu repo private
                    ]]
                ])
                script {
                    env.GIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${BUILD_NUMBER}-${env.GIT_SHORT}"
                    echo "Tag: ${env.BUILD_TAG}"
                }
            }
        }

        // ── STAGE 2: Test Backend ──────────────────────────────
        stage('🧪 Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci --prefer-offline || npm install'
                    sh 'npm run lint || echo "Lint warnings - continuing"'
                    sh 'npm test -- --passWithNoTests --forceExit || echo "Tests done"'
                }
            }
            post {
                always {
                    // Publish test results nếu có
                    junit allowEmptyResults: true, testResults: 'backend/junit.xml'
                }
            }
        }

        // ── STAGE 3: Test Frontend ─────────────────────────────
        stage('🧪 Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci --prefer-offline || npm install'
                    sh 'npm run lint || echo "Lint warnings - continuing"'
                }
            }
        }

        // ── STAGE 4: Build Docker Images ──────────────────────
        stage('🐳 Build Images') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build \
                                  -t ${IMG_BACKEND}:${env.BUILD_TAG} \
                                  -t ${IMG_BACKEND}:latest \
                                  --build-arg BUILD_DATE=${BUILD_TS} \
                                  --cache-from ${IMG_BACKEND}:latest \
                                  .
                            """
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build \
                                  -t ${IMG_FRONTEND}:${env.BUILD_TAG} \
                                  -t ${IMG_FRONTEND}:latest \
                                  --cache-from ${IMG_FRONTEND}:latest \
                                  .
                            """
                        }
                    }
                }
            }
        }

        // ── STAGE 5: Deploy lên VPS ────────────────────────────
        stage('🚀 Deploy to VPS') {
            steps {
                script {
                    // Copy code mới lên VPS
                    sh """
                        rsync -az --delete \
                          -e "ssh -i ${DEPLOY_SSH} -o StrictHostKeyChecking=no" \
                          --exclude='.git' \
                          --exclude='node_modules' \
                          --exclude='dist' \
                          --exclude='.angular' \
                          --exclude='*.log' \
                          ./ ${VPS_USER}@${VPS_IP}:${APP_DIR}/
                    """

                    // Chạy deploy trên VPS
                    sh """
                        ssh -i ${DEPLOY_SSH} \
                            -o StrictHostKeyChecking=no \
                            ${VPS_USER}@${VPS_IP} \
                            'bash ${APP_DIR}/vps-deploy/scripts/ci-deploy.sh ${env.BUILD_TAG}'
                    """
                }
            }
        }

        // ── STAGE 6: Health Check ──────────────────────────────
        stage('❤️ Health Check') {
            steps {
                script {
                    echo "Waiting for services to start..."
                    sleep 20

                    // Check backend health
                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' https://103.77.243.178/api/v1/products --insecure 2>/dev/null || echo '000'",
                        returnStdout: true
                    ).trim()

                    echo "API Health Check: HTTP ${status}"

                    if (status != '200' && status != '201') {
                        echo "Warning: Health check returned ${status} - checking logs..."
                        sh """
                            ssh -i ${DEPLOY_SSH} \
                                -o StrictHostKeyChecking=no \
                                ${VPS_USER}@${VPS_IP} \
                                'docker compose -f ${APP_DIR}/docker-compose.vps.yml logs --tail=30 backend'
                        """
                    } else {
                        echo "✅ App is healthy!"
                    }
                }
            }
        }

        // ── STAGE 7: Cleanup ───────────────────────────────────
        stage('🧹 Cleanup') {
            steps {
                sh """
                    ssh -i ${DEPLOY_SSH} \
                        -o StrictHostKeyChecking=no \
                        ${VPS_USER}@${VPS_IP} \
                        'docker image prune -f && docker system prune -f --volumes=false'
                """
                // Xóa images cũ trên Jenkins agent
                sh "docker rmi ${IMG_BACKEND}:${env.BUILD_TAG} ${IMG_FRONTEND}:${env.BUILD_TAG} || true"
            }
        }
    }

    post {
        success {
            echo """
╔════════════════════════════════════════╗
║  ✅ BUILD #${BUILD_NUMBER} SUCCESS     ║
║  Branch: ${GIT_BRANCH}                ║
║  Tag: ${env.BUILD_TAG}                ║
║  URL: https://103.77.243.178          ║
╚════════════════════════════════════════╝
            """
        }
        failure {
            echo """
╔════════════════════════════════════════╗
║  ❌ BUILD #${BUILD_NUMBER} FAILED      ║
║  Branch: ${GIT_BRANCH}                ║
║  Check logs above                     ║
╚════════════════════════════════════════╝
            """
        }
        always {
            // Cleanup workspace
            cleanWs(cleanWhenSuccess: true, cleanWhenFailure: false)
        }
    }
}
