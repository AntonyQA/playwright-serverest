import { test } from '../fixtures';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

test.describe('Excluir Produto', () => {
  test.beforeEach(async ({ loginPage, homePage, listarProdutosPage }) => {
    await loginPage.goto();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
    await homePage.assertHomePageVisible();
    await listarProdutosPage.goto();
    await listarProdutosPage.assertPaginaVisivel();
  });

  test('deve excluir o primeiro produto da lista', async ({ listarProdutosPage }) => {
    const nomeProduto = await listarProdutosPage.obterNomePrimeiroProduto();

    await listarProdutosPage.excluirPrimeiroProduto();

    await listarProdutosPage.assertTabelaVisivel();
    await listarProdutosPage.assertProdutoNaoExisteMaisNaLista(nomeProduto);
  });
});
