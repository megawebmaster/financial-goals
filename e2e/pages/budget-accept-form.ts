import type { Locator, Page } from 'playwright/test';

export class BudgetAcceptForm {
  public readonly name: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Budget name');
  }

  async submit() {
    await this.page
      .getByRole('button', { name: 'Accept the invitation' })
      .click();
  }
}
