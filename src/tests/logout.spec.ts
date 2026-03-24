import { test, expect } from '../fixtures';

const USER_EMAIL = process.env.USER_EMAIL ?? '';
const USER_PASSWORD = process.env.USER_PASSWORD ?? '';

test.describe('Logout', () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.goto();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
    await homePage.assertHomePageVisible();
  });

  test('deve realizar logout e redirecionar para login', async ({ homePage, loginPage }) => {
    await homePage.logout();

    await expect(homePage.page).toHaveURL(/.*login/);
    await loginPage.assertLoginPageVisible();
  });
});
