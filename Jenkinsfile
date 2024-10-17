pipeline {
    agent any

    environment {
        REDDIT_WATCHER_GITHUB_PUBLISH_CRED = credentials('REDDIT_WATCHER_GITHUB_PUBLISH_CREDENTIAL')
    }
    tools {
        nodejs "Node 18.18.0"
    }
    stages {
        stage("Clone Git Repository") {
            steps {
                discordSend description: 'Reddit Watcher Jenkins Pipeline Starting', footer: '', image: '', link: env.BUILD_URL, result: '', scmWebUrl: '', thumbnail: '', title: env.JOB_NAME, webhookURL: 'https://discord.com/api/webhooks/1259260941963493406/ZmHH4ZdTBe6FKKYzx7BZiaWwbDsSGeev7a3BHqh07P-Xi6AFlHLvGM0jRrkUQykS-1ps'
                // cleanWs()
                checkout scmGit(branches: [[name: 'main']], extensions: [], userRemoteConfigs: [[credentialsId: 'Github-SSH', url: 'https://github.com/nicholasMeadows/RedditWatcherReact.git']])
                readJSON file: './package.json', text: ''
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('./node_modules') {
                    deleteDir()
                }
                dir('./electron/node_modules') {
                    deleteDir()
                }
                sh "npm install"
                sh "cd electron && npm install"
                sh "npm run build"
            }
        }
        stage('Build/Package Electron App') {
            steps {
                sh 'npx cap sync @capacitor-community/electron'
                sh 'node ./build-helper-scripts/copy-package-version-for-electron.cjs'
                sh 'cd electron && npm run electron-forge:make -- --platform win32'
                sh 'node ./build-helper-scripts/reset-package-version-for-electron.cjs'
            }
        }
        stage('Build Android APK') {
            steps {
                sh 'chmod +x ./android/gradlew'
                sh 'npx cap sync android'
                sh 'chmod 600 android/keystore.properties'
                withCredentials([file(credentialsId: 'REDDIT_WATCHER_ANDROID_KEYSTORE_PROPERTIES', variable: 'keystoreProperties')]) {
                    sh 'cp $keystoreProperties android/keystore.properties'
                }
                sh 'cd android && ./gradlew clean && ./gradlew build'
            }
        }
        stage('Tag'){
            steps {
                script {
                    env.VERSION="${readJSON(file: 'package.json').version}"
                }
                sh '''
                    #!/bin/bash
                    #get current hash and see if it already has a tag
                    #git tag -d v
                    #git push --tags https://nicholasMeadows:$REDDIT_WATCHER_GITHUB_PUBLISH_CRED@github.com/nicholasMeadows/RedditWatcherReact
                    GIT_COMMIT=$(git rev-parse HEAD)
                    NEEDS_TAG=$(git describe --contains $GIT_COMMIT || true)
                    NEW_TAG="v${VERSION}"
                    
                    #only tag if no tag already
                    if [ -z "$NEEDS_TAG" ]; then
                        git tag $NEW_TAG
                        echo "Tagged with $NEW_TAG"
                        git push --tags https://nicholasMeadows:$REDDIT_WATCHER_GITHUB_PUBLISH_CRED@github.com/nicholasMeadows/RedditWatcherReact
                    else
                        echo "Already a tag on this commit"
                    fi
                '''
            }
        }
        stage('Github Release'){
            steps {
                sh '''
                    #!/bin/bash
                    # Build
                    # "make all" for example# Publish on github
                    echo "Publishing on Github..."
                    # Get the full message associated with this tag
                    tag=$(git describe --tags)
                    # Get the title and the description as separated variables
                    message="$(git for-each-ref refs/tags/$tag --format='%(contents)')"
                    description=$(echo "$message" | tail -n +3)
                    
                    # Escape line breaks to prevent json parsing problems# Create a release
                    description=$(echo "$description" | sed -z 's/\\n/\\n/g') 
                    
                    # Create a release
                    release=$(curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" --data "{\\"tag_name\\": \\"$tag\\", \\"target_commitish\\": \\"main\\", \\"name\\": \\"$tag\\", \\"body\\": \\"$description\\", \\"draft\\": false, \\"prerelease\\": true}" https://api.github.com/repos/nicholasMeadows/RedditWatcherReact/releases)
                    
                    # Extract the id of the release from the creation response
                    id=$(echo "$release" | sed -n -e 's/"id":\\ \\([0-9]\\+\\),/\\1/p' | head -n 1 | sed 's/[[:blank:]]//g')

                    # Upload the artifact
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./electron/out/make/squirrel.windows/x64/reddit_watcher-$VERSION-full.nupkg" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id/assets?name=reddit_watcher-$VERSION-full.nupkg
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./electron/out/make/squirrel.windows/x64/reddit-watcher-$VERSION Setup.exe" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id/assets?name=reddit-watcher-$VERSION%20Setup.exe
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./electron/out/make/squirrel.windows/x64/RELEASES" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id/assets?name=RELEASES
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./electron/out/make/zip/win32/x64/reddit-watcher-win32-x64-$VERSION.zip" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id/assets?name=reddit-watcher-win32-x64-$VERSION.zip
                    curl -XPOST -H "Authorization:token $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" -H "Content-Type:application/octet-stream" -T "./android/app/build/outputs/apk/release/app-release.apk" https://uploads.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id/assets?name=reddit-watcher-$VERSION.apk

                    #Mark this relase as latest
                    curl -L \
                    -X PATCH \
                    -H "Accept: application/vnd.github+json" \
                    -H "Authorization: Bearer $REDDIT_WATCHER_GITHUB_PUBLISH_CRED" \
                    -H "X-GitHub-Api-Version: 2022-11-28" \
                    https://api.github.com/repos/nicholasMeadows/RedditWatcherReact/releases/$id \
                    -d '{"prerelease":false, "make_latest": true}'
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
