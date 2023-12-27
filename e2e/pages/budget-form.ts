import type { Locator, Page } from 'playwright/test';

export class BudgetForm {
  public readonly name: Locator;
  public readonly submit: Locator;

  constructor(page: Page) {
    this.name = page.getByLabel('Budget name');
    this.submit = page.getByRole('button', { name: 'Create budget!' });
  }
}
