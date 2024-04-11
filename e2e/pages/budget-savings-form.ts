import type { Locator, Page } from 'playwright/test';

export class BudgetSavingsForm {
  public readonly date: Locator;
  public readonly amount: Locator;
  public readonly submit: Locator;

  constructor(page: Page) {
    this.date = page.getByLabel('Date');
    this.amount = page.getByLabel('Amount');
    this.submit = page.getByRole('button', { name: 'Add savings!' });
  }
}
