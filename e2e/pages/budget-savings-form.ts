import type { Locator, Page } from 'playwright/test';

export class BudgetSavingsForm {
  public readonly date: Locator;
  public readonly amount: Locator;

  constructor(private readonly page: Page) {
    this.date = page.getByLabel('Date');
    this.amount = page.getByLabel('Amount');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Add savings!' }).click();
  }
}
