import type { Locator, Page } from 'playwright/test';

export class BudgetForm {
  public readonly name: Locator;
  public readonly isDefault: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Budget name');
    this.isDefault = page.getByLabel('Is default?');
  }

  submit() {
    return this.page
      .getByRole('button', { name: /Create budget|Save changes/ })
      .click();
  }
}
