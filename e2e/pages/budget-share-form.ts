import type { Locator, Page } from 'playwright/test';

export class BudgetShareForm {
  public readonly username: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Email');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Share the budget' }).click();
  }
}
