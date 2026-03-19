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
                sh """
                    rm -rf ${APP_DIR}/*
                    cp -r * ${APP_DIR}/

                    cd ${APP_DIR}

                    docker compose -f docker-compose.vps.yml down
                    docker compose -f docker-compose.vps.yml build --no-cache
                    docker compose -f docker-compose.vps.yml up -d
                """
            }
        }

        stage('❤️ Health Check') {
            steps {
                script {
                    sleep 20

                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/products || echo '000'",
                        returnStdout: true
                    ).trim()

                    if (status != '200') {
                        error("App failed!")
                    }
                }
            }
        }
    }
}