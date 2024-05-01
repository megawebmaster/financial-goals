import type { Page } from 'playwright/test';
import { expect } from '../test';

export class InvitationsPage {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  async accept(budgetName: string) {
    await this.getInvitation(budgetName)
      .getByRole('link', { name: 'Accept' })
      .click();
    await expect(
      this.page.getByText('Accept the budget invitation'),
    ).toBeVisible();
  }

  async decline(budgetName: string) {
    await this.getInvitation(budgetName)
      .getByRole('button', { name: 'Decline' })
      .click();

    await expect(this.page.getByText('Your invitations:')).toBeVisible();
    await expect(this.page.getByText(budgetName)).not.toBeAttached();
  }

  private getInvitation(budgetName: string) {
    return this.page.getByText(budgetName);
  }
}
