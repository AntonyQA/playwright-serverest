import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, CREDENTIALS } from './env.js';

/**
 * Realiza o login na API e retorna o token de autorização.
 * Deve ser chamado dentro de `setup()` ou no início de cada VU
 * quando o cenário exige autenticação.
 *
 * @returns {string} Token no formato "Bearer <jwt>"
 * @throws Falha no check se o login não retornar status 200
 */
export function login() {
  const res = http.post(
    `${BASE_URL}/login`,
    JSON.stringify(CREDENTIALS),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    '[auth] login status 200': (r) => r.status === 200,
    '[auth] token presente na resposta': (r) => !!r.json('authorization'),
  });

  return res.json('authorization');
}

/**
 * Monta o objeto de headers padrão com autorização para requisições autenticadas.
 *
 * @param {string} token - Token retornado pelo `login()`
 * @returns {object} Headers com Content-Type e Authorization
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  };
}
