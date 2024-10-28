import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

import { BudgetGoalForm } from './budget-goal-form';

export class GoalsPage {
  public readonly quickGoals: Locator;
  public readonly longGoals: Locator;

  constructor(private readonly page: Page) {
    this.quickGoals = page
      .getByLabel('List of short-term goals')
      .locator('tbody')
      .getByRole('row');
    this.longGoals = page
      .getByLabel('List of long-term goals')
      .locator('tbody')
      .getByRole('row');
  }

  async goToNewGoal() {
    await this.page.getByRole('link', { name: 'Create new goal' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Add a goal', exact: false }),
    ).toBeVisible();
  }

  async addGoal(goalName: string, requiredAmount: string) {
    await this.goToNewGoal();
    const goalForm = new BudgetGoalForm(this.page);
    await goalForm.selectType('Quick goal');
    await goalForm.name.fill(goalName);
    await goalForm.amount.fill(requiredAmount);
    await goalForm.submit();
    await expect(this.quickGoals.getByText('First goal')).toBeVisible();
  }

  async goToEditGoal(type: string, name: string) {
    await this.getGoal(type, name).getByRole('link', { name: 'Edit' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Update goal' }),
    ).toBeVisible();
  }

  moveGoalUp(type: string, name: string) {
    return this.getGoal(type, name).getByTitle('Move up').click();
  }

  moveGoalDown(type: string, name: string) {
    return this.getGoal(type, name).getByTitle('Move down').click();
  }

  private getGoal(type: string, name: string) {
    if (type === 'quick') {
      return this.page
        .getByLabel('List of short-term goals')
        .getByRole('row', { name });
    }

    return this.page
      .getByLabel('List of long-term goals')
      .getByRole('row', { name });
  }
}
