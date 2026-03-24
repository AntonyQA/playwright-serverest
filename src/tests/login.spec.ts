import { test, expect } from '../fixtures';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.assertLoginPageVisible();
  });

  test('deve realizar login com credenciais válidas', async ({ loginPage, homePage }) => {
    await loginPage.login(USER_EMAIL, USER_PASSWORD);

    await homePage.assertHomePageVisible();
    await homePage.assertWelcomeMessage('Bem Vindo');
  });

  test('deve exibir erro com credenciais inválidas', async ({ loginPage }) => {
    await loginPage.login('invalido@teste.com', 'senha-errada');

    await loginPage.assertErrorAlertVisible();
    await loginPage.assertErrorAlertContains('Email e/ou senha inválidos');
  });

  test('deve manter na página de login após falha de autenticação', async ({ loginPage }) => {
    await loginPage.login('invalido@teste.com', 'senha-errada');

    await expect(loginPage.page).toHaveURL(/.*login/);
  });
});
