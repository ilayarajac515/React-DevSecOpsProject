pipeline{
    agent any

    triggers {
        githubPush()
    }
    
    stages{
        stage("Build"){
            steps{
                sh "echo Hello World `1" 
            }
        }
    }
}
