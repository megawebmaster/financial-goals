import type { Locator, Page } from 'playwright/test';

export class BudgetPage {
  public readonly addGoal: Locator;
  public readonly addSavings: Locator;

  constructor(private readonly page: Page) {
    this.addGoal = page.getByRole('link', { name: 'Create goal' });
    this.addSavings = page.getByRole('link', { name: 'Add savings' });
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
