import { test } from '../fixtures';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

test.describe('Home', () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.goto();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
    await homePage.assertHomePageVisible();
  });

  test('deve exibir mensagem de boas-vindas ao usuário', async ({ homePage }) => {
    await homePage.assertWelcomeMessage('Bem Vindo');
  });

  test('deve exibir todos os links de navegação', async ({ homePage }) => {
    await homePage.assertNavLinksVisible();
  });
});
