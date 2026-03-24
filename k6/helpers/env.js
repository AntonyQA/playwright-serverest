/**
 * Centraliza todas as variáveis de ambiente e constantes de configuração.
 * Os valores podem ser sobrescritos via flags `-e VAR=valor` ao rodar o K6.
 */

/** URL base da API ServeRest. */
export const BASE_URL = __ENV.BASE_URL || 'https://serverest.dev';

/** Credenciais do usuário administrador para autenticação. */
export const CREDENTIALS = {
  email: __ENV.USER_EMAIL || 'fulano@qa.com',
  password: __ENV.USER_PASSWORD || 'teste',
};
