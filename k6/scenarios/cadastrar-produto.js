/**
 * Cenário de Carga — Cadastrar Produto
 *
 * Testa o endpoint POST /produtos sob carga, simulando o fluxo completo
 * de cadastro: login → criação do produto → validação da resposta.
 * Cada VU cria um produto com nome único para evitar conflitos.
 *
 * Execução isolada:
 *   k6 run k6/scenarios/cadastrar-produto.js
 *   k6 run k6/scenarios/cadastrar-produto.js -e LOAD_PROFILE=load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { getLoadProfile } from '../config/options.js';
import { BASE_URL } from '../helpers/env.js';
import { login, authHeaders } from '../helpers/auth.js';
import { buildProductPayload } from '../helpers/utils.js';

const cadastroDuration = new Trend('cadastro_produto_duration_ms');
const cadastroErrors   = new Rate('cadastro_produto_error_rate');
const produtosCriados  = new Counter('produtos_criados_total');

export const options = {
  ...getLoadProfile(),
  thresholds: {
    cadastro_produto_duration_ms: ['p(95)<3000'],
    cadastro_produto_error_rate:  ['rate<0.01'],
  },
};

/**
 * Obtém token de autenticação antes dos VUs iniciarem.
 * @returns {string} Token JWT
 */
export function setup() {
  return login();
}

/** Função principal: cada VU cadastra um produto por iteração. */
export default function cadastrarProdutoScenario(token) {
  group('POST /produtos — cadastro de produto', () => {
    const payload = buildProductPayload();

    const res = http.post(
      `${BASE_URL}/produtos`,
      JSON.stringify(payload),
      authHeaders(token)
    );

    const ok = check(res, {
      'status 201':                    (r) => r.status === 201,
      '_id retornado':                 (r) => !!r.json('_id'),
      'mensagem de sucesso':           (r) => r.json('message') === 'Cadastro realizado com sucesso',
      'resposta abaixo de 3s':         (r) => r.timings.duration < 3000,
    });

    cadastroDuration.add(res.timings.duration);
    cadastroErrors.add(!ok);

    if (ok) {
      produtosCriados.add(1);
    }
  });

  sleep(1);
}
