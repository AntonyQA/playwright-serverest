pipeline {
    agent any

    // ─── Variáveis de ambiente ────────────────────────────────────────────────
    // BASE_URL, USER_EMAIL e USER_PASSWORD devem ser cadastradas como
    // "Secret text" em Jenkins → Manage Jenkins → Credentials.
    environment {
        BASE_URL       = credentials('SERVEREST_BASE_URL')
        USER_EMAIL     = credentials('SERVEREST_USER_EMAIL')
        USER_PASSWORD  = credentials('SERVEREST_USER_PASSWORD')

        // Garante que o Playwright reconhece o ambiente de CI
        CI = 'true'

        // Pasta onde o Playwright salva o relatório HTML
        PW_REPORT_DIR = 'playwright-report'

        // Resultado K6 em texto para arquivamento
        K6_RESULT_FILE = 'k6-result.txt'
    }

    // ─── Opções gerais do pipeline ────────────────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    // ─── Stages ───────────────────────────────────────────────────────────────
    stages {

        // 1. Checkout do código
        stage('Checkout') {
            steps {
                echo '>>> Fazendo checkout do repositorio...'
                checkout scm
            }
        }

        // 2. Cria o arquivo .env a partir das credenciais do Jenkins
        stage('Setup Environment') {
            steps {
                echo '>>> Criando arquivo .env com as credenciais...'
                bat """
                    (echo BASE_URL=%BASE_URL%
                    echo USER_EMAIL=%USER_EMAIL%
                    echo USER_PASSWORD=%USER_PASSWORD%) > .env
                """
            }
        }

        // 3. Instala dependências Node
        stage('Install Dependencies') {
            steps {
                echo '>>> Instalando dependencias npm...'
                bat 'node --version'
                bat 'npm --version'
                bat 'npm ci'
            }
        }

        // 3. Instala os binários dos browsers do Playwright
        stage('Install Playwright Browsers') {
            steps {
                echo '>>> Instalando browsers do Playwright...'
                bat 'npx playwright install chromium'
            }
        }

        // 4. Testes E2E com Playwright
        stage('Playwright E2E Tests') {
            steps {
                echo '>>> Executando testes E2E com Playwright...'
                bat 'npm test'
            }
            post {
                always {
                    // Publica o relatório HTML do Playwright como artefato
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : "${PW_REPORT_DIR}",
                        reportFiles          : 'index.html',
                        reportName           : 'Playwright Report',
                        reportTitles         : 'Playwright E2E'
                    ])

                    // Arquiva screenshots e vídeos de falhas (se houver)
                    archiveArtifacts(
                        artifacts         : 'test-results/**/*',
                        allowEmptyArchive : true
                    )
                }
            }
        }

        // 5. Testes de carga K6 (smoke — perfil leve, ideal para CI)
        // Este stage só roda se o K6 estiver instalado no agente Windows.
        stage('K6 Smoke Tests') {
            when {
                expression {
                    bat(script: 'where k6', returnStatus: true) == 0
                }
            }
            steps {
                echo '>>> Executando testes de smoke com K6...'
                bat "npm run k6:smoke > ${K6_RESULT_FILE} 2>&1"
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts         : "${K6_RESULT_FILE}",
                        allowEmptyArchive : true
                    )
                }
            }
        }
    }

    // ─── Notificações pós-pipeline ────────────────────────────────────────────
    post {
        success {
            echo 'Pipeline concluido com sucesso!'
        }
        failure {
            echo 'Pipeline falhou. Verifique os artefatos e logs acima.'
            // Descomente para enviar e-mail em caso de falha:
            // mail to: 'seu-time@example.com',
            //      subject: "[FALHA] ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //      body: "Build URL: ${env.BUILD_URL}"
        }
        unstable {
            echo 'Pipeline instavel (algum teste falhou mas o build continuou).'
        }
        always {
            echo '>>> Limpando workspace...'
            cleanWs()
        }
    }
}
