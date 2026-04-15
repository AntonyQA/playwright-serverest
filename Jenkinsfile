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
        // Mantém os últimos 10 builds e seus artefatos
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))

        // Timeout global: se o pipeline demorar mais de 30 min, cancela
        timeout(time: 30, unit: 'MINUTES')

        // Evita builds paralelos do mesmo branch
        disableConcurrentBuilds()

        // Marca o timestamp em cada linha de log
        timestamps()
    }

    // ─── Stages ───────────────────────────────────────────────────────────────
    stages {

        // 1. Checkout do código
        stage('Checkout') {
            steps {
                echo '>>> Fazendo checkout do repositório...'
                checkout scm
            }
        }

        // 2. Instala dependências Node
        stage('Install Dependencies') {
            steps {
                echo '>>> Instalando dependências npm...'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        // 3. Instala os binários dos browsers do Playwright
        stage('Install Playwright Browsers') {
            steps {
                echo '>>> Instalando browsers do Playwright...'
                sh 'npx playwright install --with-deps chromium'
            }
        }

        // 4. Testes E2E com Playwright
        stage('Playwright E2E Tests') {
            steps {
                echo '>>> Executando testes E2E com Playwright...'
                sh 'npm test'
            }
            post {
                always {
                    // Publica o relatório HTML do Playwright como artefato
                    publishHTML(target: [
                        allowMissing         : false,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : "${PW_REPORT_DIR}",
                        reportFiles          : 'index.html',
                        reportName           : 'Playwright Report',
                        reportTitles         : 'Playwright E2E'
                    ])

                    // Arquiva screenshots e vídeos de falhas (se houver)
                    archiveArtifacts(
                        artifacts          : 'test-results/**/*',
                        allowEmptyArchive  : true
                    )
                }
            }
        }

        // 5. Testes de carga K6 (smoke — perfil leve, ideal para CI)
        stage('K6 Smoke Tests') {
            // Só roda se o K6 estiver instalado na máquina do agente.
            // Remova o "when" abaixo se K6 sempre estiver disponível.
            when {
                expression {
                    sh(script: 'which k6 || command -v k6', returnStatus: true) == 0
                }
            }
            steps {
                echo '>>> Executando testes de smoke com K6...'
                sh "npm run k6:smoke 2>&1 | tee ${K6_RESULT_FILE}"
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
            echo '✔ Pipeline concluído com sucesso!'
        }
        failure {
            echo '✘ Pipeline falhou. Verifique os artefatos e logs acima.'
            // Descomente o bloco abaixo para enviar e-mail em caso de falha:
            // mail to: 'seu-time@example.com',
            //      subject: "[FALHA] ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //      body: "Build URL: ${env.BUILD_URL}"
        }
        unstable {
            echo '⚠ Pipeline instável (algum teste falhou mas o build continuou).'
        }
        always {
            echo '>>> Limpando workspace...'
            cleanWs()
        }
    }
}
