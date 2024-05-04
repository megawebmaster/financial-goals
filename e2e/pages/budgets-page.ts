import type { Page } from 'playwright/test';
import { expect } from '../test';

export class BudgetsPage {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  createBudget() {
    return this.page.getByRole('link', { name: 'Create budget' }).click();
  }

  async visitInvitations() {
    await this.page.getByRole('link', { name: 'Invitations' }).click();
    await expect(this.page.getByText('Your invitations')).toBeVisible();
    await expect(this.page.getByText('Decrypting data…')).not.toBeAttached();
  }
}
