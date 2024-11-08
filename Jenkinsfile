pipeline {
    agent any

    environment {
        REDDIT_WATCHER_GITHUB_PUBLISH_CRED = credentials('REDDIT_WATCHER_GITHUB_PUBLISH_CREDENTIAL')
    }
    tools {
        nodejs "Node 18.18.0"
    }
    stages {
        stage("Checkout") {
            steps {
                discordSend description: 'Reddit Watcher Jenkins Pipeline Starting', footer: '', image: '', link: env.BUILD_URL, result: '', scmWebUrl: '', thumbnail: '', title: env.JOB_NAME, webhookURL: 'https://discord.com/api/webhooks/1259260941963493406/ZmHH4ZdTBe6FKKYzx7BZiaWwbDsSGeev7a3BHqh07P-Xi6AFlHLvGM0jRrkUQykS-1ps'
//              Disable cleanWS due to scm polling kickcing off builds constantly
//                 cleanWs()
                checkout scmGit(branches: [[name: 'main']], userRemoteConfigs: [[credentialsId: 'Github-SSH', url: 'https://github.com/nicholasMeadows/RedditWatcherReact.git']])
                
                script {
                    packageJson = readJSON file: "package.json"
                    env.version = packageJson.version
                    env.tagName = "v"+env.version
                    tagFound = sh(returnStdout: true, script: "git tag -l '${tagName}'")
                    
                    sh 'echo "This is a test ${tagFound}"'
                
                    if (tagFound?.trim()) {
                        error("Github tag " + env.tagName + " alreay exists")
                    }
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('./node_modules') {
                    deleteDir()
                }
                sh "npm install"
            }
        }
        stage('Build/Package Electron App') {
            steps {
                sh 'npm run package:windows'
            }
        }
        stage('Build Android APK') {
            steps {
                sh 'npx cap sync android'

                dir('android'){
                    sh 'touch keystore.properties'
                    sh 'chmod 600 keystore.properties'
                    
                    withCredentials([file(credentialsId: 'REDDIT_WATCHER_ANDROID_KEYSTORE_PROPERTIES', variable: 'keystoreProperties')]) {
                        sh 'cp $keystoreProperties keystore.properties'
                    }
                    
                    sh 'chmod +x gradlew'
                    sh './gradlew clean'
                    sh './gradlew build'
                }
            }
        }
        stage('Publish Release'){
            steps {
                sh '''
                    #!/bin/bash
                    description=$(git for-each-ref refs/tags/$tagName --format='%(contents)' | sed -z 's/\\n/\\n/g')
                    releaseResponseBody=$(curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" --data \"{\\"tag_name\\": \\"$tagName\\", \\"target_commitish\\": \\"main\\", \\"name\\": \\"$tagName\\", \\"body\\": \\"$description\\", \\"draft\\":false, \\"prerelease\\":true }\" https://api.github.com/repos/nicholasMeadows/RedditWatcherReact/releases)
                    releaseId=$(echo "$releaseResponseBody" | sed -n -e \'s/"id":\\ \\([0-9]\\+\\),/\\1/p\' | head -n 1 | sed \'s/[[:blank:]]//g\')

                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./dist/electron-builder-dist/reddit-watcher-$version.exe" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$releaseId/assets?name=reddit-watcher-$version.exe
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./android/app/build/outputs/apk/release/app-release.apk" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$releaseId/assets?name=reddit-watcher-$version.apk
                    curl -L -X PATCH -H "Accept: application/vnd.github+json" -H "Authorization: Bearer $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$releaseId -d \"{\\"prerelease\\":false, \\"make_latest\\": true}\"
                '''
            }
        }
    }
    post {
        success {
            discordSend description: 'Reddit Watcher Jenkins Pipeline Success', footer: '', image: '', link: env.BUILD_URL, result: 'SUCCESS', scmWebUrl: '', thumbnail: 'https://cdn3.iconfinder.com/data/icons/basicolor-arrows-checks/24/155_check_ok_sticker_success-512.png', title: env.JOB_NAME, webhookURL: 'https://discord.com/api/webhooks/1259260941963493406/ZmHH4ZdTBe6FKKYzx7BZiaWwbDsSGeev7a3BHqh07P-Xi6AFlHLvGM0jRrkUQykS-1ps'
        }
        failure {
            discordSend description: 'Reddit Watcher Jenkins Pipeline Failure', footer: '', image: '', link: env.BUILD_URL, result: 'FAILURE', scmWebUrl: '', thumbnail: 'https://cdn-icons-png.flaticon.com/512/2860/2860188.png', title: env.JOB_NAME, webhookURL: 'https://discord.com/api/webhooks/1259260941963493406/ZmHH4ZdTBe6FKKYzx7BZiaWwbDsSGeev7a3BHqh07P-Xi6AFlHLvGM0jRrkUQykS-1ps'
        }
    }
}