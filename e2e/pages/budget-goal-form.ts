import type { Locator, Page } from 'playwright/test';

export class BudgetGoalForm {
  public readonly name: Locator;
  public readonly amount: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Goal name');
    this.amount = page.getByLabel('Required amount');
  }

  submit() {
    return this.page
      .getByRole('button', { name: /Create goal!|Update goal!/ })
      .click();
  }

  deleteGoal() {
    return this.page.getByRole('button', { name: 'Delete goal' }).click();
  }
}
