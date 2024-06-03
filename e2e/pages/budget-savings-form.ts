import type { Locator, Page } from 'playwright/test';

export class BudgetSavingsForm {
  public readonly amount: Locator;

  constructor(private readonly page: Page) {
    this.amount = page.getByLabel('Amount');
  }

  async pickDate(day: string) {
    await this.page.getByLabel('Date').click();
    await this.page.getByRole('gridcell', { name: day }).first().click();
  }

  submit() {
    return this.page
      .getByRole('button', { name: /Add savings|Save changes/ })
      .click();
  }
}
