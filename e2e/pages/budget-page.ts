import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetPage {
  public readonly currentSavings: Locator;
  public readonly freeSavings: Locator;
  public readonly goals: Locator;

  constructor(private readonly page: Page) {
    this.goals = page.getByRole('listitem');
    this.currentSavings = page.locator('p', {
      has: page.getByText('Current savings'),
    });
    this.freeSavings = page.locator('p', {
      has: page.getByText('Free, unused savings'),
    });
  }

  async addGoal() {
    await this.page.getByRole('link', { name: 'Create new goal' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Add a goal' }),
    ).toBeVisible();
  }

  async addSavings() {
    await this.page.getByRole('link', { name: 'Add savings' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Saved money' }),
    ).toBeVisible();
  }

  async editGoal(name: string) {
    await this.getGoal(name).getByRole('link', { name: 'Edit' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Update goal' }),
    ).toBeVisible();
  }

  moveGoalUp(name: string) {
    // TODO: Fix moving up/down
    return this.getGoal(name).getByRole('button', { name: 'Move up' }).click();
  }

  moveGoalDown(name: string) {
    // TODO: Fix moving up/down
    return this.getGoal(name)
      .getByRole('button', { name: 'Move down' })
      .click();
  }

  async share() {
    await this.page.getByRole('link', { name: 'Share' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Share the budget with family' }),
    ).toBeVisible();
  }

  private getGoal(name: string) {
    return this.page.getByText(name);
  }
}
