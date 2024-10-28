import type { Locator, Page } from 'playwright/test';

export class BudgetForm {
  public readonly name: Locator;
  public readonly currency: Locator;
  public readonly isDefault: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Budget name');
    this.currency = page.getByLabel('Currency');
    this.isDefault = page.getByLabel('Is default?');
  }

  async selectCurrency(currency: string) {
    await this.currency.click();
    await this.page.getByLabel('Suggestions').getByText(currency).click();
    return this.name.click();
  }

  submit() {
    return this.page
      .getByRole('button', { name: /Create budget|Save changes/ })
      .click();
  }
}
