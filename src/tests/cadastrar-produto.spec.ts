import { test, expect } from '../fixtures';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

const celular = {
  nome: `Celular Samsung Galaxy S24 ${Date.now()}`,
  preco: '3499',
  descricao: 'Smartphone Android com câmera de 200MP, 8GB RAM e 256GB de armazenamento.',
  quantidade: '15',
};

test.describe('Cadastrar Produto', () => {
  test.beforeEach(async ({ loginPage, homePage, cadastrarProdutoPage }) => {
    await loginPage.goto();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
    await homePage.assertHomePageVisible();
    await cadastrarProdutoPage.goto();
    await cadastrarProdutoPage.assertFormularioVisivel();
  });

  test('deve cadastrar um celular com sucesso', async ({ cadastrarProdutoPage }) => {
    await cadastrarProdutoPage.cadastrarProduto(celular);

    await cadastrarProdutoPage.assertRedirecionouParaListagem();
  });

  test('deve preencher todos os campos do formulário corretamente', async ({ cadastrarProdutoPage, page }) => {
    await cadastrarProdutoPage.preencherFormulario(celular);

    await expect(page.getByTestId('nome')).toHaveValue(celular.nome);
    await expect(page.getByTestId('preco')).toHaveValue(celular.preco);
    await expect(page.getByTestId('descricao')).toHaveValue(celular.descricao);
    await expect(page.getByTestId('quantity')).toHaveValue(celular.quantidade);
  });
});
