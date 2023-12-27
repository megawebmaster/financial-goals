import type { Locator, Page } from 'playwright/test';

export class BudgetGoalForm {
  public readonly name: Locator;
  public readonly amount: Locator;
  public readonly submit: Locator;

  constructor(page: Page) {
    this.name = page.getByLabel('Goal name');
    this.amount = page.getByLabel('Required amount');
    this.submit = page.getByRole('button', { name: 'Create goal!' });
  }
}
