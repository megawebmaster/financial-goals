import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetGoalForm {
  public readonly name: Locator;
  public readonly amount: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Goal name');
    this.amount = page.getByLabel('Required amount');
  }

  async selectType(type: string) {
    return this.page.getByLabel(type).click();
  }

  submit() {
    return this.page
      .getByRole('button', { name: /Create a goal|Save changes/ })
      .click();
  }

  async deleteGoal() {
    await this.page.getByRole('button', { name: 'Delete this goal' }).click();
    await this.page
      .getByRole('button', { name: 'Yes, delete the goal' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Are you absolutely sure?' }),
    ).not.toBeAttached();
  }
}
