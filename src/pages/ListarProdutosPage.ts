import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para a tela de listagem de produtos (/admin/listarprodutos).
 * Cobre a leitura da tabela e a exclusão de produtos.
 */
export class ListarProdutosPage extends BasePage {
  private readonly tabela: Locator;
  private readonly linhas: Locator;

  constructor(page: Page) {
    super(page);
    this.tabela = page.locator('table');
    // Cada linha do tbody representa um produto listado
    this.linhas = page.locator('table tbody tr');
  }

  /** Navega para a página de listagem de produtos. */
  async goto(): Promise<void> {
    await this.navigate('/admin/listarprodutos');
  }

  /** Verifica que a página foi carregada e a tabela está visível. */
  async assertPaginaVisivel(): Promise<void> {
    await expect(this.page).toHaveURL(/.*listarprodutos/);
    await expect(this.tabela).toBeVisible();
  }

  /**
   * Retorna o nome do primeiro produto da lista.
   * Útil para capturar o valor antes da exclusão e validar depois.
   */
  async obterNomePrimeiroProduto(): Promise<string> {
    return (await this.linhas.first().locator('td').first().textContent()) ?? '';
  }

  /** Clica no botão "Excluir" da primeira linha da tabela. */
  async excluirPrimeiroProduto(): Promise<void> {
    await this.linhas.first().getByRole('button', { name: 'Excluir' }).click();
  }

  /** Verifica que o produto informado não aparece mais na lista após a exclusão. */
  async assertProdutoNaoExisteMaisNaLista(nomeProduto: string): Promise<void> {
    await expect(this.page.getByText(nomeProduto, { exact: true })).not.toBeVisible();
  }

  /** Verifica que a tabela de produtos continua visível. */
  async assertTabelaVisivel(): Promise<void> {
    await expect(this.tabela).toBeVisible();
  }
}
