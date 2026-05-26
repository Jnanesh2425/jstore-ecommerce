pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "jnaneshnr123/jstore-frontend"
        BACKEND_IMAGE = "jnaneshnr123/jstore-backend"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Jnanesh2425/jstore-ecommerce.git'
            }
        }

        stage('Frontend Lint') {
            steps {
                dir('Frontend') {
                    sh 'npm install'
                    sh 'npm run lint || true'
                }
            }
        }

        stage('Frontend Test') {
            steps {
                dir('Frontend') {
                    sh 'npm test -- --run'
                }
            }
        }

        stage('Backend Lint') {
            steps {
                dir('Backend') {
                    sh 'npm install'
                    sh 'npm run lint || true'
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('Frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE .'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('Backend') {
                    sh 'docker build -t $BACKEND_IMAGE .'
                }
            }
        }

        stage('DockerHub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push $FRONTEND_IMAGE'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push $BACKEND_IMAGE'
            }
        }

        stage('Deploy Frontend Container') {
            steps {
                sh 'docker stop frontend-container || true'
                sh 'docker rm frontend-container || true'

                sh '''
                docker run -d \
                --name frontend-container \
                -p 3000:80 \
                $FRONTEND_IMAGE
                '''
            }
        }

        stage('Deploy Backend Container') {
            steps {
                sh 'docker stop backend-container || true'
                sh 'docker rm backend-container || true'

                sh '''
                docker run -d \
                --name backend-container \
                -p 8080:8080 \
                $BACKEND_IMAGE
                '''
            }
        }
    }
}