pipeline {
    agent any

    environment {
        APP_NAME     = 'viufilm3d'
        CONTAINER_NAME = 'viufilm'
        HOST_PORT    = '80'
        CONTAINER_PORT = '10000'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== [Stage 1] Checking out source code ==='
                checkout scm
            }
        }

        stage('Validate & Test') {
            steps {
                echo '=== [Stage 2] Running validation & typecheck ==='
                sh '''
                    # Kiểm tra môi trường Node.js
                    node -v
                    npm -v

                    # Cài đặt dependencies sạch
                    npm ci

                    # Kiểm tra types TypeScript
                    npm run typecheck

                    # Kiểm tra định dạng code
                    npm run format:check
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '=== [Stage 3] Building Docker image ==='
                sh '''
                    docker build -t ${APP_NAME}:latest .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo '=== [Stage 4] Deploying application container ==='
                sh '''
                    # Kiểm tra sự tồn tại của file .env.local
                    if [ ! -f .env.local ]; then
                        echo "Cảnh báo: Không tìm thấy file .env.local. Đang tạo từ .env.example..."
                        cp .env.example .env.local
                    fi

                    # Dừng và gỡ container cũ nếu đang chạy
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
                        echo "Dừng container cũ ${CONTAINER_NAME}..."
                        docker rm -f ${CONTAINER_NAME}
                    fi

                    # Khởi động container mới
                    echo "Khởi chạy container mới ${CONTAINER_NAME} trên cổng ${HOST_PORT}..."
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart always \
                        -p ${HOST_PORT}:${CONTAINER_PORT} \
                        --env-file .env.local \
                        ${APP_NAME}:latest
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '=== [Stage 5] Verifying deployment health ==='
                sh '''
                    # Chờ ứng dụng khởi động
                    echo "Đang kiểm tra trạng thái khởi động của container..."
                    sleep 10

                    SUCCESS=0
                    CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_NAME} 2>/dev/null || echo "")

                    for i in $(seq 1 10); do
                        echo "Lần kiểm tra $i/10..."
                        if [ -n "$CONTAINER_IP" ] && curl -s -f http://${CONTAINER_IP}:${CONTAINER_PORT}/api/health > /dev/null; then
                            echo "✅ ViuFilm3D đã sẵn sàng và hoạt động bình thường!"
                            SUCCESS=1
                            break
                        elif curl -s -f http://host.docker.internal:${HOST_PORT}/api/health > /dev/null; then
                            echo "✅ ViuFilm3D đã sẵn sàng và hoạt động bình thường qua host.docker.internal!"
                            SUCCESS=1
                            break
                        elif curl -s -f http://127.0.0.1:${HOST_PORT}/api/health > /dev/null; then
                            echo "✅ ViuFilm3D đã sẵn sàng và hoạt động bình thường qua localhost!"
                            SUCCESS=1
                            break
                        fi
                        sleep 3
                    done

                    if [ $SUCCESS -ne 1 ]; then
                        echo "❌ Health check thất bại! Log container:"
                        docker logs --tail 50 ${CONTAINER_NAME}
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        always {
            echo '=== [Cleanup] Dọn dẹp tài nguyên tạm ==='
            sh '''
                # Dọn dẹp Docker images dangling (không dùng) để tiết kiệm dung lượng đĩa
                docker image prune -f || true
            '''
        }
        success {
            echo '🎉 ViuFilm3D CI/CD Pipeline hoàn tất thành công!'
        }
        failure {
            echo '❌ Pipeline thất bại! Vui lòng kiểm tra console output ở trên.'
        }
    }
}
