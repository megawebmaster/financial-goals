import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';
import { BudgetGoalForm } from './budget-goal-form';

export class BudgetPage {
  public readonly currentSavings: Locator;
  public readonly freeSavings: Locator;
  public readonly goals: Locator;

  constructor(private readonly page: Page) {
    this.goals = page.getByLabel('All goals').locator('tbody').getByRole('row');
    this.currentSavings = page.locator('p', {
      has: page.getByText('Current savings'),
    });
    this.freeSavings = page.locator('p', {
      has: page.getByText('Free, unused savings'),
    });
  }

  async goToNewGoal() {
    await this.page.getByRole('link', { name: 'Create new goal' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Add a goal' }),
    ).toBeVisible();
  }

  async addGoal(goalName: string, requiredAmount: string) {
    await this.goToNewGoal();
    const goalForm = new BudgetGoalForm(this.page);
    await goalForm.name.fill(goalName);
    await goalForm.amount.fill(requiredAmount);
    await goalForm.submit();
    await expect(this.goals.getByText('First goal')).toBeVisible();
  }

  async goToEditGoal(name: string) {
    await this.getGoal(name).getByRole('link', { name: 'Edit' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Update goal' }),
    ).toBeVisible();
  }

  moveGoalUp(name: string) {
    return this.getGoal(name).getByTitle('Move up').click();
  }

  moveGoalDown(name: string) {
    return this.getGoal(name).getByTitle('Move down').click();
  }

  async addSavings() {
    await this.page.getByRole('link', { name: 'Add savings' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Saved money' }),
    ).toBeVisible();
  }

  async share() {
    await this.page.getByRole('link', { name: 'Share' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Share the budget with family' }),
    ).toBeVisible();
  }

  private getGoal(name: string) {
    return this.page.getByLabel('All goals').getByRole('row', { name });
  }
}
