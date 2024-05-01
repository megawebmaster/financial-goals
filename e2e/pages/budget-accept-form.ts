import type { Locator, Page } from 'playwright/test';

export class BudgetAcceptForm {
  public readonly name: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Name');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Accept invitation' }).click();
  }
}
