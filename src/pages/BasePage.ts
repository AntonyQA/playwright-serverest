import { Page } from '@playwright/test';

/**
 * Classe base para todos os Page Objects.
 * Centraliza funcionalidades comuns de navegação e estado de página,
 * evitando duplicação de código nas classes filhas.
 */
export abstract class BasePage {
  constructor(readonly page: Page) {}

  /**
   * Navega para o caminho relativo informado.
   * A URL base é configurada no playwright.config.ts via `baseURL`.
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /** Aguarda o carregamento completo da página (sem requisições de rede pendentes). */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
