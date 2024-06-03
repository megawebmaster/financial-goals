import type { Page } from 'playwright/test';
import { expect } from '../test';

export class InvitationsPage {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  async accept(budgetName: string) {
    await this.getInvitation(budgetName)
      .locator('a', { hasText: 'Accept' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Accept the invitation' }),
    ).toBeVisible();
  }

  async decline(budgetName: string) {
    await this.getInvitation(budgetName)
      .locator('button', { hasText: 'Decline' })
      .click();

    await expect(this.page.getByText('List of your invitations')).toBeVisible();
    await expect(this.page.getByText(budgetName)).not.toBeAttached();
  }

  private getInvitation(budgetName: string) {
    return this.page
      .getByLabel('List of your invitations')
      .getByRole('row', { name: budgetName });
  }
}
