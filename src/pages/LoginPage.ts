import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para a tela de Login (/login).
 * Encapsula todos os seletores e ações relacionados à autenticação.
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('senha');
    this.loginButton = page.getByTestId('entrar');
    // Alerta de erro exibido quando as credenciais são inválidas
    this.errorAlert = page.getByRole('alert');
  }

  /** Navega diretamente para a página de login. */
  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  /** Preenche o formulário e submete as credenciais. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Verifica que os campos e o botão de login estão visíveis na tela. */
  async assertLoginPageVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /** Verifica que o alerta de erro está visível após tentativa de login inválida. */
  async assertErrorAlertVisible(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }

  /** Verifica que o alerta de erro contém o texto esperado. */
  async assertErrorAlertContains(message: string): Promise<void> {
    await expect(this.errorAlert).toContainText(message);
  }
}
