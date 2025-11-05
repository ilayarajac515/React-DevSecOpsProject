pipeline {
    agent any
    triggers {
        githubPush()
    }
    stages {
        stage('Test') {
            steps {
                echo "Webhook trigger success ✅"
            }
        }
    }
}
