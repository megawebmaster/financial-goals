import type { Locator, Page } from 'playwright/test';

export class BudgetsPage {
  public readonly newBudget: Locator;

  constructor(page: Page) {
    this.newBudget = page.getByRole('link', { name: 'Create budget' });
  }
}
