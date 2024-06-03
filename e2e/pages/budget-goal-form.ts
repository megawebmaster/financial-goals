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
      .getByRole('button', { name: /Create goal|Save changes/ })
      .click();
  }

  async deleteGoal() {
    await this.page.getByRole('button', { name: 'Delete this goal' }).click();
    await this.page
      .getByRole('button', { name: 'Yes, delete the goal' })
      .click();
  }
}
