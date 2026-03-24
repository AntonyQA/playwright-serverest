/**
 * Cenário de Carga — Login
 *
 * Testa a capacidade do endpoint POST /login sob diferentes cargas.
 * Valida: status HTTP, presença do token JWT e tempo de resposta.
 *
 * Execução isolada:
 *   k6 run k6/scenarios/login.js
 *   k6 run k6/scenarios/login.js -e LOAD_PROFILE=load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { getLoadProfile } from '../config/options.js';
import { BASE_URL, CREDENTIALS } from '../helpers/env.js';

// Métricas customizadas para o cenário de login
const loginDuration = new Trend('login_duration_ms');
const loginErrors   = new Rate('login_error_rate');
const loginCount    = new Counter('login_total');

export const options = {
  ...getLoadProfile(),
  thresholds: {
    login_duration_ms: ['p(95)<2000'],
    login_error_rate:  ['rate<0.01'],
  },
};

/** Função principal executada por cada VU em cada iteração. */
export default function loginScenario() {
  group('POST /login — credenciais válidas', () => {
    const res = http.post(
      `${BASE_URL}/login`,
      JSON.stringify(CREDENTIALS),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const ok = check(res, {
      'status 200':              (r) => r.status === 200,
      'token na resposta':       (r) => !!r.json('authorization'),
      'mensagem de sucesso':     (r) => r.json('message') === 'Login realizado com sucesso',
      'resposta abaixo de 2s':   (r) => r.timings.duration < 2000,
    });

    loginDuration.add(res.timings.duration);
    loginErrors.add(!ok);
    loginCount.add(1);
  });

  group('POST /login — credenciais inválidas', () => {
    const res = http.post(
      `${BASE_URL}/login`,
      JSON.stringify({ email: 'invalido@k6.com', password: 'errado' }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, {
      'status 401 para credenciais inválidas': (r) => r.status === 401,
      'mensagem de erro presente':             (r) => !!r.json('message'),
    });
  });

  sleep(1);
}
