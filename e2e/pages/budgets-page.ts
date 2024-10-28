import type { Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetsPage {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  async createBudget() {
    await this.page.getByRole('button', { name: 'Budgets' }).click();
    await this.page
      .getByRole('menuitem', { name: 'Create new budget' })
      .click();
  }

  async visitInvitations() {
    await this.page.getByRole('button', { name: 'First budget' }).click();
    await this.page.getByRole('menuitem', { name: 'Invitations' }).click();
    await expect(this.page.getByText('List of your invitations')).toBeVisible();
    await expect(this.page.getByText('Decrypting data…')).not.toBeAttached();
  }
}
