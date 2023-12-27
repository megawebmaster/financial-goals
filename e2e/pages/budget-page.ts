import type { Locator, Page } from 'playwright/test';

export class BudgetPage {
  public readonly addGoal: Locator;
  public readonly addSavings: Locator;

  constructor(page: Page) {
    this.addGoal = page.getByRole('link', { name: 'Create goal' });
    this.addSavings = page.getByRole('link', { name: 'Add savings' });
  }
}
