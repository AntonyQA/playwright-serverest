/**
 * Cenário de Carga — Excluir Produto
 *
 * Testa o fluxo completo de exclusão: cada VU cria um produto e
 * em seguida o deleta, garantindo que o teste é autossuficiente
 * e não depende de dados pré-existentes ou deixa lixo no banco.
 *
 * Fluxo por iteração:
 *   1. POST /produtos  → cria produto e captura _id
 *   2. DELETE /produtos/:id → exclui o produto recém-criado
 *
 * Execução isolada:
 *   k6 run k6/scenarios/excluir-produto.js
 *   k6 run k6/scenarios/excluir-produto.js -e LOAD_PROFILE=load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { getLoadProfile } from '../config/options.js';
import { BASE_URL } from '../helpers/env.js';
import { login, authHeaders } from '../helpers/auth.js';
import { buildProductPayload } from '../helpers/utils.js';

const excluirDuration  = new Trend('excluir_produto_duration_ms');
const excluirErrors    = new Rate('excluir_produto_error_rate');
const produtosExcluidos = new Counter('produtos_excluidos_total');

export const options = {
  ...getLoadProfile(),
  thresholds: {
    excluir_produto_duration_ms: ['p(95)<3000'],
    excluir_produto_error_rate:  ['rate<0.01'],
  },
};

/**
 * Obtém token de autenticação antes dos VUs iniciarem.
 * @returns {string} Token JWT
 */
export function setup() {
  return login();
}

/** Função principal: cria e exclui um produto por iteração. */
export default function excluirProdutoScenario(token) {
  let productId;

  // ── Step 1: criar produto para ter algo a deletar ──────────────────────────
  group('POST /produtos — criação antes da exclusão', () => {
    const res = http.post(
      `${BASE_URL}/produtos`,
      JSON.stringify(buildProductPayload()),
      authHeaders(token)
    );

    check(res, {
      '[setup] produto criado com status 201': (r) => r.status === 201,
      '[setup] _id presente':                  (r) => !!r.json('_id'),
    });

    productId = res.json('_id');
  });

  // Só executa a exclusão se o produto foi criado com sucesso
  if (!productId) {
    excluirErrors.add(1);
    return;
  }

  sleep(0.5);

  // ── Step 2: excluir o produto criado ──────────────────────────────────────
  group('DELETE /produtos/:id — exclusão do produto', () => {
    const res = http.del(
      `${BASE_URL}/produtos/${productId}`,
      null,
      authHeaders(token)
    );

    const ok = check(res, {
      'status 200':              (r) => r.status === 200,
      'mensagem de exclusão':    (r) => r.json('message') === 'Registro excluído com sucesso',
      'resposta abaixo de 3s':   (r) => r.timings.duration < 3000,
    });

    excluirDuration.add(res.timings.duration);
    excluirErrors.add(!ok);

    if (ok) {
      produtosExcluidos.add(1);
    }
  });

  sleep(1);
}
