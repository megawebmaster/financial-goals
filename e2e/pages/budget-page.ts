import type { Locator, Page } from 'playwright/test';
import { expect } from 'playwright/test';

export class BudgetPage {
  private readonly addGoalLink: Locator;
  private readonly addSavingsLink: Locator;

  constructor(private readonly page: Page) {
    this.addGoalLink = page.getByRole('link', { name: 'Create goal' });
    this.addSavingsLink = page.getByRole('link', { name: 'Add savings' });
  }

  async addGoal() {
    await this.addGoalLink.click();
    await expect(
      this.page.getByRole('heading', { name: 'Add a goal' }),
    ).toBeVisible();
  }

  async addSavings() {
    await this.addSavingsLink.click();
    await expect(
      this.page.getByRole('heading', { name: 'Add savings' }),
    ).toBeVisible();
  }

  moveGoalUp(name: string) {
    return this.getGoal(name).getByRole('button', { name: 'Move up' }).click();
  }

  moveGoalDown(name: string) {
    return this.getGoal(name)
      .getByRole('button', { name: 'Move down' })
      .click();
  }

  private getGoal(name: string) {
    return this.page.getByText(name);
  }
}
