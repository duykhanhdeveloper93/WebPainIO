pipeline {
    agent any

    environment {
        APP_DIR   = '/opt/paintco'
        GIT_REPO  = 'https://github.com/duykhanhdeveloper93/WebPainIO.git'
        GIT_BRANCH = 'develop'

        DEPLOY_SSH = credentials('vps-deploy-ssh')
        VPS_IP   = '103.77.243.178'
        VPS_USER = 'root'
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
                        url: "${GIT_REPO}"
                    ]]
                ])
            }
        }

        stage('🚀 Deploy to VPS') {
            steps {
                sh """
                    rsync -az --delete \
                      -e "ssh -i ${DEPLOY_SSH} -o StrictHostKeyChecking=no" \
                      --exclude='.git' \
                      --exclude='node_modules' \
                      --exclude='dist' \
                      ./ ${VPS_USER}@${VPS_IP}:${APP_DIR}/
                """

                sh """
                    ssh -i ${DEPLOY_SSH} \
                    -o StrictHostKeyChecking=no \
                    ${VPS_USER}@${VPS_IP} \
                    'bash ${APP_DIR}/vps-deploy/scripts/ci-deploy.sh'
                """
            }
        }

        stage('❤️ Health Check') {
            steps {
                script {
                    sleep 20

                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://${VPS_IP}/api/v1/products || echo '000'",
                        returnStdout: true
                    ).trim()

                    echo "Health: ${status}"

                    if (status != '200') {
                        error("App failed!")
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