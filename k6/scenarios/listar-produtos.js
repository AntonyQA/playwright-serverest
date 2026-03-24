/**
 * Cenário de Carga — Listar Produtos
 *
 * Testa o endpoint GET /produtos, que corresponde ao acesso à tela de
 * listagem de produtos no painel administrativo.
 * É o cenário mais simples e de maior volume — representa leitura pura.
 *
 * Execução isolada:
 *   k6 run k6/scenarios/listar-produtos.js
 *   k6 run k6/scenarios/listar-produtos.js -e LOAD_PROFILE=load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { getLoadProfile } from '../config/options.js';
import { BASE_URL } from '../helpers/env.js';
import { login, authHeaders } from '../helpers/auth.js';

const listDuration = new Trend('listar_produtos_duration_ms');
const listErrors   = new Rate('listar_produtos_error_rate');

export const options = {
  ...getLoadProfile(),
  thresholds: {
    listar_produtos_duration_ms: ['p(95)<2000'],
    listar_produtos_error_rate:  ['rate<0.01'],
  },
};

/**
 * Obtém token de autenticação uma vez antes de todos os VUs.
 * @returns {string} Token JWT
 */
export function setup() {
  return login();
}

/** Função principal: cada VU requisita a lista de produtos. */
export default function listarProdutosScenario(token) {
  group('GET /produtos — listagem completa', () => {
    const res = http.get(`${BASE_URL}/produtos`, authHeaders(token));

    const ok = check(res, {
      'status 200':                 (r) => r.status === 200,
      'possui campo quantidade':    (r) => typeof r.json('quantidade') === 'number',
      'array produtos não-nulo':    (r) => Array.isArray(r.json('produtos')),
      'resposta abaixo de 2s':      (r) => r.timings.duration < 2000,
    });

    listDuration.add(res.timings.duration);
    listErrors.add(!ok);
  });

  sleep(1);
}
