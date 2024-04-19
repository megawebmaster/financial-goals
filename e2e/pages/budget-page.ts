import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetPage {
  public readonly currentSavings: Locator;
  public readonly freeSavings: Locator;
  private readonly addGoalLink: Locator;
  private readonly addSavingsLink: Locator;
  private readonly shareLink: Locator;

  constructor(private readonly page: Page) {
    this.addGoalLink = page.getByRole('link', { name: 'Create goal' });
    this.addSavingsLink = page.getByRole('link', { name: 'Add savings' });
    this.shareLink = page.getByRole('link', { name: 'Share' });
    this.currentSavings = page.locator('p', {
      has: page.getByText('Current savings'),
    });
    this.freeSavings = page.locator('p', {
      has: page.getByText('Free, unused savings'),
    });
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

  async editGoal(name: string) {
    await this.getGoal(name).getByRole('link', { name: 'Edit' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Update goal' }),
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

  async share() {
    await this.shareLink.click();
    await expect(
      this.page.getByRole('heading', { name: 'Share the budget with family' }),
    ).toBeVisible();
  }

  private getGoal(name: string) {
    return this.page.getByText(name);
  }
}
