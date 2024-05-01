import type { Page } from 'playwright/test';

export class BudgetsPage {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  createBudget() {
    return this.page.getByRole('link', { name: 'Create budget' }).click();
  }
}
