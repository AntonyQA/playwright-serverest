import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Dados necessários para cadastrar um produto. */
export interface ProdutoData {
  nome: string;
  preco: string;
  descricao: string;
  quantidade: string;
}

/**
 * Page Object para o formulário de cadastro de produtos (/admin/cadastrarprodutos).
 * Encapsula o preenchimento do formulário e a submissão.
 */
export class CadastrarProdutoPage extends BasePage {
  private readonly nomeInput: Locator;
  private readonly precoInput: Locator;
  private readonly descricaoInput: Locator;
  private readonly quantidadeInput: Locator;
  private readonly cadastrarButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nomeInput = page.getByTestId('nome');
    this.precoInput = page.getByTestId('preco');
    this.descricaoInput = page.getByTestId('descricao');
    this.quantidadeInput = page.getByTestId('quantity');
    // Nota: o data-testid original da aplicação tem typo ("cadastar" sem "r")
    this.cadastrarButton = page.getByTestId('cadastarProdutos');
  }

  /** Navega para o formulário de cadastro de produtos. */
  async goto(): Promise<void> {
    await this.navigate('/admin/cadastrarprodutos');
  }

  /** Preenche todos os campos do formulário sem submeter. */
  async preencherFormulario(produto: ProdutoData): Promise<void> {
    await this.nomeInput.fill(produto.nome);
    await this.precoInput.fill(produto.preco);
    await this.descricaoInput.fill(produto.descricao);
    await this.quantidadeInput.fill(produto.quantidade);
  }

  /** Clica no botão de cadastrar para submeter o formulário. */
  async submeter(): Promise<void> {
    await this.cadastrarButton.click();
  }

  /**
   * Fluxo completo: preenche o formulário e submete.
   * Conveniência para testes que não precisam validar o estado intermediário.
   */
  async cadastrarProduto(produto: ProdutoData): Promise<void> {
    await this.preencherFormulario(produto);
    await this.submeter();
  }

  /** Verifica que todos os campos do formulário estão visíveis. */
  async assertFormularioVisivel(): Promise<void> {
    await expect(this.nomeInput).toBeVisible();
    await expect(this.precoInput).toBeVisible();
    await expect(this.descricaoInput).toBeVisible();
    await expect(this.quantidadeInput).toBeVisible();
    await expect(this.cadastrarButton).toBeVisible();
  }

  /**
   * Verifica que após o cadastro bem-sucedido houve redirecionamento
   * para a listagem de produtos.
   */
  async assertRedirecionouParaListagem(): Promise<void> {
    await expect(this.page).toHaveURL(/.*listarprodutos/);
  }
}
