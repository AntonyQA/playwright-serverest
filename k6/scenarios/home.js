/**
 * Cenário de Carga — Home (Dashboard)
 *
 * Simula o acesso ao dashboard após login, testando os endpoints
 * que alimentam a tela inicial do painel administrativo.
 * Fluxo: login → GET /produtos → GET /usuarios
 *
 * Execução isolada:
 *   k6 run k6/scenarios/home.js
 *   k6 run k6/scenarios/home.js -e LOAD_PROFILE=load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { getLoadProfile } from '../config/options.js';
import { BASE_URL } from '../helpers/env.js';
import { login, authHeaders } from '../helpers/auth.js';

const homeDuration = new Trend('home_duration_ms');
const homeErrors   = new Rate('home_error_rate');

export const options = {
  ...getLoadProfile(),
  thresholds: {
    home_duration_ms: ['p(95)<2000'],
    home_error_rate:  ['rate<0.01'],
  },
};

/**
 * Executado uma vez antes dos VUs iniciarem.
 * Obtém o token de autenticação para reutilizar entre VUs.
 *
 * @returns {string} Token JWT de autorização
 */
export function setup() {
  return login();
}

/** Função principal executada por cada VU. Recebe o token do setup(). */
export default function homeScenario(token) {
  group('Dashboard — carregamento inicial', () => {
    // Simula o carregamento da listagem de produtos exibida na home
    group('GET /produtos', () => {
      const res = http.get(`${BASE_URL}/produtos`, authHeaders(token));

      const ok = check(res, {
        'status 200':                   (r) => r.status === 200,
        'campo quantidade presente':    (r) => r.json('quantidade') !== undefined,
        'array de produtos presente':   (r) => Array.isArray(r.json('produtos')),
        'resposta abaixo de 2s':        (r) => r.timings.duration < 2000,
      });

      homeDuration.add(res.timings.duration);
      homeErrors.add(!ok);
    });

    // Simula o carregamento da listagem de usuários
    group('GET /usuarios', () => {
      const res = http.get(`${BASE_URL}/usuarios`, authHeaders(token));

      check(res, {
        'status 200':                (r) => r.status === 200,
        'array de usuários presente':(r) => Array.isArray(r.json('usuarios')),
      });
    });
  });

  sleep(1);
}
