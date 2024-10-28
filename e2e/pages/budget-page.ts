import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetPage {
  public readonly currentSavings: Locator;
  public readonly freeSavings: Locator;

  constructor(private readonly page: Page) {
    this.currentSavings = page.locator('p', {
      has: page.getByText('Current savings'),
    });
    this.freeSavings = page.locator('p', {
      has: page.getByText('Free, unused savings'),
    });
  }

  async addSavings() {
    await this.page.getByRole('link', { name: 'Add savings' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Saved money' }),
    ).toBeVisible();
  }

  async share() {
    await this.page.getByRole('link', { name: 'Share' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Share the budget with family' }),
    ).toBeVisible();
  }
}
