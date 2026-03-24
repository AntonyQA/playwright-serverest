import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { CadastrarProdutoPage } from '../pages/CadastrarProdutoPage';
import { ListarProdutosPage } from '../pages/ListarProdutosPage';

/**
 * Mapa de fixtures customizadas disponíveis para os testes.
 * Cada entry instancia automaticamente o Page Object correspondente,
 * eliminando a necessidade de `new XyzPage(page)` em cada spec.
 */
type Pages = {
  loginPage: LoginPage;
  homePage: HomePage;
  cadastrarProdutoPage: CadastrarProdutoPage;
  listarProdutosPage: ListarProdutosPage;
};

/**
 * Extensão do `test` base do Playwright com as fixtures de Page Objects.
 * Importar este `test` nos specs em vez do original `@playwright/test`.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  cadastrarProdutoPage: async ({ page }, use) => {
    await use(new CadastrarProdutoPage(page));
  },

  listarProdutosPage: async ({ page }, use) => {
    await use(new ListarProdutosPage(page));
  },
});

export { expect } from '@playwright/test';
