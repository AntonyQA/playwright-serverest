# 🎭 Playwright Automation — ServeRest Frontend

Projeto de automação de testes E2E utilizando **Playwright** + **TypeScript**, aplicando o padrão **Page Object Model (POM)** para o site [ServeRest Frontend](https://front.serverest.dev).

---

## 📁 Estrutura do Projeto

```
src/
├── fixtures/
│   └── index.ts               # Extensão do test com fixtures customizadas (injeção de pages)
├── pages/                     # Page Objects — encapsulam seletores e ações por página
│   ├── BasePage.ts            # Classe base com métodos comuns de navegação
│   ├── LoginPage.ts           # Página de login
│   ├── HomePage.ts            # Home do painel admin
│   ├── CadastrarProdutoPage.ts # Formulário de cadastro de produto
│   └── ListarProdutosPage.ts  # Listagem e exclusão de produtos
└── tests/                     # Specs de teste — apenas orquestram ações e assertions
    ├── login.spec.ts
    ├── logout.spec.ts
    ├── home.spec.ts
    ├── cadastrar-produto.spec.ts
    └── excluir-produto.spec.ts
```

---

## ✅ Casos de Teste

| Suite | Cenário |
|---|---|
| **Login** | Login com credenciais válidas |
| **Login** | Erro com credenciais inválidas |
| **Login** | Permanece na página após falha |
| **Logout** | Logout e redirecionamento para login |
| **Home** | Exibe mensagem de boas-vindas |
| **Home** | Exibe links de navegação |
| **Cadastrar Produto** | Cadastra produto com sucesso |
| **Cadastrar Produto** | Preenche formulário corretamente |
| **Excluir Produto** | Exclui o primeiro produto da lista |

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/)

### Instalação

```bash
npm install
npx playwright install chromium
```

### Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

```env
BASE_URL=https://front.serverest.dev
USER_EMAIL=fulano@qa.com
USER_PASSWORD=teste
```

### Executar os testes

```bash
# Headless (padrão — sem abrir browser)
npm test

# Com browser visível
npm run test:headed

# Modo debug (step-by-step)
npm run test:debug

# Interface gráfica do Playwright
npm run test:ui

# Abrir relatório HTML após execução
npm run report
```

---

## 🏗️ Padrões e Boas Práticas

- **Page Object Model (POM):** toda lógica de seletores e interações fica nas classes de `pages/`, mantendo os testes limpos e legíveis.
- **Fixtures customizadas:** as pages são injetadas via `fixtures/index.ts`, eliminando `new Page()` repetido nos testes.
- **Variáveis de ambiente:** credenciais e URL base via `.env` (nunca hardcoded).
- **Assertions explícitas:** cada Page Object expõe métodos `assert*` que encapsulam os `expect()` do Playwright.
- **Worker único:** testes rodam sequencialmente em um único browser para fluxo previsível e fácil observação visual.

---

## 🛠️ Stack

| Ferramenta | Versão |
|---|---|
| [Playwright](https://playwright.dev/) | ^1.x |
| [TypeScript](https://www.typescriptlang.org/) | ^5.x |
| [Node.js](https://nodejs.org/) | >= 18 |

---

## 📊 Relatório

Após rodar os testes, o relatório HTML é gerado em `playwright-report/`. Para visualizar:

```bash
npm run report
```
