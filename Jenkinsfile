pipeline {
    agent any

    environment {
        VPS_HOST = '138.2.109.17'
        VPS_USER = 'ubuntu'
        SSH_KEY  = '/var/jenkins_home/.ssh/id_rsa'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Deploy to VPS via SSH') {
            steps {
                echo '=== [Stage 1] Kết nối VPS Oracle và cập nhật ViuFilm3D ==='
                sh '''
                    ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
                        set -e
                        echo "1. Pull code mới nhất từ GitHub về VPS..."
                        cd ~/ViuFilm3D
                        git fetch origin main
                        git reset --hard origin/main

                        echo "2. Build Docker Image trên VPS..."
                        docker build -t viufilm3d .

                        echo "3. Khởi động lại container viufilm..."
                        docker rm -f viufilm || true
                        docker run -d \
                            --name viufilm \
                            --restart always \
                            -p 80:10000 \
                            --env-file .env.local \
                            viufilm3d

                        echo "4. Container đang chạy:"
                        docker ps | grep viufilm
EOF
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '=== [Stage 2] Kiểm tra Health Check trên VPS ==='
                sh '''
                    ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
                        echo "Chờ 8 giây cho container khởi động..."
                        sleep 8

                        SUCCESS=0
                        for i in $(seq 1 5); do
                            echo "Kiểm tra lần $i/5..."
                            if curl -s -f http://127.0.0.1:80/api/health > /dev/null; then
                                echo "✅ ViuFilm3D trên VPS đã hoạt động tốt (HTTP 200)!"
                                SUCCESS=1
                                break
                            fi
                            sleep 3
                        done

                        if [ $SUCCESS -ne 1 ]; then
                            echo "❌ Health check thất bại trên VPS! Log 50 dòng cuối của container:"
                            docker logs --tail 50 viufilm
                            exit 1
                        fi
EOF
                '''
            }
        }
    }

    post {
        always {
            sh '''
                ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "docker image prune -f || true"
            '''
        }
        success {
            echo '🎉 Chúc mừng! Ứng dụng đã được cập nhật thành công lên VPS 138.2.109.17!'
        }
        failure {
            echo '❌ Pipeline thất bại! Vui lòng kiểm tra log chi tiết.'
        }
    }
}