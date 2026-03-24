import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para a tela Home do painel administrativo (/admin/home).
 * Cobre a navegação principal e as ações disponíveis após o login.
 */
export class HomePage extends BasePage {
  private readonly logoutButton: Locator;
  private readonly welcomeHeading: Locator;
  private readonly registerUsersLink: Locator;
  private readonly listUsersLink: Locator;
  private readonly registerProductsLink: Locator;
  private readonly listProductsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.getByTestId('logout');
    this.welcomeHeading = page.getByRole('heading', { level: 1 });
    this.registerUsersLink = page.getByTestId('cadastrar-usuarios');
    this.listUsersLink = page.getByTestId('listar-usuarios');
    this.registerProductsLink = page.getByTestId('cadastrar-produtos');
    this.listProductsLink = page.getByTestId('listar-produtos');
  }

  /** Verifica que a home foi carregada com sucesso após o login. */
  async assertHomePageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/.*admin\/home/);
    await expect(this.logoutButton).toBeVisible();
  }

  /** Verifica que o heading de boas-vindas contém o nome parcial do usuário. */
  async assertWelcomeMessage(partialName: string): Promise<void> {
    await expect(this.welcomeHeading).toContainText(partialName);
  }

  /** Verifica que todos os links de navegação da navbar estão visíveis. */
  async assertNavLinksVisible(): Promise<void> {
    await expect(this.registerUsersLink).toBeVisible();
    await expect(this.listUsersLink).toBeVisible();
    await expect(this.registerProductsLink).toBeVisible();
    await expect(this.listProductsLink).toBeVisible();
  }

  /** Realiza o logout clicando no botão correspondente na navbar. */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
