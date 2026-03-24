/**
 * Master Runner — Todos os Cenários de Carga
 *
 * Executa todos os cenários simultaneamente usando o sistema de `scenarios`
 * do K6, cada um com seu próprio pool de VUs e schedule de início.
 * O escalonamento (stagger) evita que todos os cenários gerem pico
 * simultâneo na inicialização.
 *
 * Uso:
 *   k6 run k6/run-all.js                         → smoke (padrão)
 *   k6 run k6/run-all.js -e LOAD_PROFILE=load    → load test
 *   k6 run k6/run-all.js -e LOAD_PROFILE=stress  → stress test
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Trend, Rate, Counter } from 'k6/metrics';
import { sharedThresholds } from './config/options.js';
import { BASE_URL, CREDENTIALS } from './helpers/env.js';
import { login, authHeaders } from './helpers/auth.js';
import { buildProductPayload } from './helpers/utils.js';

// ─── Métricas customizadas por feature ────────────────────────────────────────
const metrics = {
  loginDuration:    new Trend('login_duration_ms'),
  homeDuration:     new Trend('home_duration_ms'),
  cadastroDuration: new Trend('cadastro_produto_duration_ms'),
  listarDuration:   new Trend('listar_produtos_duration_ms'),
  excluirDuration:  new Trend('excluir_produto_duration_ms'),
  errorRate:        new Rate('global_error_rate'),
  produtosCriados:  new Counter('produtos_criados_total'),
  produtosExcluidos:new Counter('produtos_excluidos_total'),
};

// ─── Definição de carga por perfil ────────────────────────────────────────────
const profile  = __ENV.LOAD_PROFILE || 'smoke';

const loadStages = {
  smoke: {
    vus: 1,
    iterations: 3,
  },
  load: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  stress: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 80 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

function buildExecutor(startTime = '0s') {
  if (profile === 'smoke') {
    return {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 3,
      startTime,
    };
  }
  return {
    executor: 'ramping-vus',
    stages: loadStages[profile],
    startTime,
  };
}

// ─── Opções K6 com todos os cenários ──────────────────────────────────────────
export const options = {
  scenarios: {
    /** Cenário 1: testa autenticação — inicia imediatamente */
    login: {
      ...buildExecutor('0s'),
      exec: 'loginScenario',
    },
    /** Cenário 2: testa o dashboard — inicia 5s após o login */
    home: {
      ...buildExecutor('5s'),
      exec: 'homeScenario',
    },
    /** Cenário 3: testa listagem de produtos — inicia 10s após o início */
    listarProdutos: {
      ...buildExecutor('10s'),
      exec: 'listarProdutosScenario',
    },
    /** Cenário 4: testa cadastro de produto — inicia 15s após o início */
    cadastrarProduto: {
      ...buildExecutor('15s'),
      exec: 'cadastrarProdutoScenario',
    },
    /** Cenário 5: testa exclusão de produto — inicia 20s após o início */
    excluirProduto: {
      ...buildExecutor('20s'),
      exec: 'excluirProdutoScenario',
    },
  },
  thresholds: {
    ...sharedThresholds,
    login_duration_ms:           ['p(95)<2000'],
    home_duration_ms:            ['p(95)<2000'],
    listar_produtos_duration_ms: ['p(95)<2000'],
    cadastro_produto_duration_ms:['p(95)<3000'],
    excluir_produto_duration_ms: ['p(95)<3000'],
    global_error_rate:           ['rate<0.01'],
  },
};

// ─── Setup global — obtém token uma única vez para todos os VUs ───────────────
export function setup() {
  return login();
}

// ─── Funções de cenário (exportadas e referenciadas pelo `exec` acima) ────────

/** Cenário de Login */
export function loginScenario() {
  group('login', () => {
    const res = http.post(
      `${BASE_URL}/login`,
      JSON.stringify(CREDENTIALS),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const ok = check(res, {
      '[login] status 200':          (r) => r.status === 200,
      '[login] token presente':      (r) => !!r.json('authorization'),
      '[login] resposta < 2s':       (r) => r.timings.duration < 2000,
    });

    metrics.loginDuration.add(res.timings.duration);
    metrics.errorRate.add(!ok);
  });
  sleep(1);
}

/** Cenário de Home */
export function homeScenario(token) {
  group('home', () => {
    const res = http.get(`${BASE_URL}/produtos`, authHeaders(token));

    const ok = check(res, {
      '[home] status 200':          (r) => r.status === 200,
      '[home] produtos presente':   (r) => Array.isArray(r.json('produtos')),
      '[home] resposta < 2s':       (r) => r.timings.duration < 2000,
    });

    metrics.homeDuration.add(res.timings.duration);
    metrics.errorRate.add(!ok);
  });
  sleep(1);
}

/** Cenário de Listar Produtos */
export function listarProdutosScenario(token) {
  group('listar-produtos', () => {
    const res = http.get(`${BASE_URL}/produtos`, authHeaders(token));

    const ok = check(res, {
      '[listar] status 200':        (r) => r.status === 200,
      '[listar] tem quantidade':    (r) => typeof r.json('quantidade') === 'number',
      '[listar] resposta < 2s':     (r) => r.timings.duration < 2000,
    });

    metrics.listarDuration.add(res.timings.duration);
    metrics.errorRate.add(!ok);
  });
  sleep(1);
}

/** Cenário de Cadastrar Produto */
export function cadastrarProdutoScenario(token) {
  group('cadastrar-produto', () => {
    const res = http.post(
      `${BASE_URL}/produtos`,
      JSON.stringify(buildProductPayload()),
      authHeaders(token)
    );

    const ok = check(res, {
      '[cadastrar] status 201':     (r) => r.status === 201,
      '[cadastrar] _id retornado':  (r) => !!r.json('_id'),
      '[cadastrar] resposta < 3s':  (r) => r.timings.duration < 3000,
    });

    metrics.cadastroDuration.add(res.timings.duration);
    metrics.errorRate.add(!ok);

    if (ok) metrics.produtosCriados.add(1);
  });
  sleep(1);
}

/** Cenário de Excluir Produto */
export function excluirProdutoScenario(token) {
  let productId;

  group('excluir-produto — criar', () => {
    const res = http.post(
      `${BASE_URL}/produtos`,
      JSON.stringify(buildProductPayload()),
      authHeaders(token)
    );

    check(res, {
      '[excluir/criar] status 201': (r) => r.status === 201,
    });

    productId = res.json('_id');
  });

  if (!productId) {
    metrics.errorRate.add(1);
    return;
  }

  sleep(0.5);

  group('excluir-produto — deletar', () => {
    const res = http.del(
      `${BASE_URL}/produtos/${productId}`,
      null,
      authHeaders(token)
    );

    const ok = check(res, {
      '[excluir] status 200':       (r) => r.status === 200,
      '[excluir] mensagem ok':      (r) => r.json('message') === 'Registro excluído com sucesso',
      '[excluir] resposta < 3s':    (r) => r.timings.duration < 3000,
    });

    metrics.excluirDuration.add(res.timings.duration);
    metrics.errorRate.add(!ok);

    if (ok) metrics.produtosExcluidos.add(1);
  });

  sleep(1);
}
