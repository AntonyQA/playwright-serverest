/**
 * Funções utilitárias compartilhadas entre os cenários de teste de carga.
 */

/**
 * Gera um nome de produto único baseado em timestamp + número aleatório.
 * Evita conflitos de nome duplicado na API ServeRest.
 *
 * @returns {string} Nome único para produto de teste
 */
export function randomProductName() {
  return `K6-Produto-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Gera um payload completo e válido para cadastro de produto.
 *
 * @returns {object} Dados do produto prontos para serialização JSON
 */
export function buildProductPayload() {
  return {
    nome: randomProductName(),
    preco: Math.floor(Math.random() * 5000) + 100,
    descricao: 'Produto criado pelo teste de carga K6',
    quantidade: Math.floor(Math.random() * 100) + 1,
  };
}
