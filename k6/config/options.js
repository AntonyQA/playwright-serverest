/**
 * Perfis de carga reutilizáveis para todos os cenários K6.
 *
 * Uso: selecione o perfil via variável de ambiente LOAD_PROFILE
 *   k6 run script.js -e LOAD_PROFILE=smoke
 *   k6 run script.js -e LOAD_PROFILE=load
 *   k6 run script.js -e LOAD_PROFILE=stress
 *
 * Perfis disponíveis:
 *  - smoke  → valida que o script funciona (1 VU, curta duração)
 *  - load   → carga normal esperada em produção
 *  - stress → empurra o sistema além do limite para encontrar o ponto de ruptura
 */

/** Thresholds compartilhados aplicados a todos os cenários. */
export const sharedThresholds = {
  // 95% das requisições devem responder em menos de 2 segundos
  http_req_duration: ['p(95)<2000'],
  // Taxa de erros HTTP deve ser inferior a 1%
  http_req_failed: ['rate<0.01'],
};

const profiles = {
  /**
   * Smoke Test — 1 VU, 1 min.
   * Objetivo: verificar que o script não possui erros antes de rodar cargas maiores.
   */
  smoke: {
    vus: 1,
    duration: '1m',
    thresholds: {
      ...sharedThresholds,
      http_req_duration: ['p(95)<3000'],
    },
  },

  /**
   * Load Test — rampa até 20 VUs, mantém por 3 min, rampa para baixo.
   * Objetivo: simular carga normal/esperada do sistema.
   */
  load: {
    stages: [
      { duration: '1m', target: 10 },  // rampa de subida
      { duration: '3m', target: 20 },  // carga sustentada
      { duration: '1m', target: 0 },   // rampa de descida
    ],
    thresholds: {
      ...sharedThresholds,
    },
  },

  /**
   * Stress Test — rampa agressiva até 50 VUs com picos.
   * Objetivo: identificar o ponto de ruptura e comportamento sob sobrecarga.
   */
  stress: {
    stages: [
      { duration: '1m', target: 20 },  // aquecimento
      { duration: '2m', target: 50 },  // carga alta
      { duration: '1m', target: 80 },  // pico extremo
      { duration: '2m', target: 50 },  // retorno ao alto
      { duration: '1m', target: 0 },   // recuperação
    ],
    thresholds: {
      ...sharedThresholds,
      http_req_duration: ['p(95)<5000'], // threshold mais tolerante para stress
    },
  },
};

/**
 * Retorna as opções K6 para o perfil selecionado.
 * Usa `smoke` como padrão se LOAD_PROFILE não estiver definido.
 *
 * @returns {object} Opções K6 prontas para `export const options`
 */
export function getLoadProfile() {
  const profile = __ENV.LOAD_PROFILE || 'smoke';
  const selected = profiles[profile];

  if (!selected) {
    throw new Error(`Perfil de carga desconhecido: "${profile}". Use: smoke | load | stress`);
  }

  return selected;
}
