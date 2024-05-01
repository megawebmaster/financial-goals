import type { Locator, Page } from 'playwright/test';

export class BudgetForm {
  public readonly name: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Budget name');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Create budget!' }).click();
  }
}
