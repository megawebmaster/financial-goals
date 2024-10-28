import type { Page } from 'playwright/test';
import { expect } from '../test';

export class Layout {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  async logout() {
    await this.page.getByRole('button', { name: 'Toggle user menu' }).click();
    await this.page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(this.page.getByText('Sign up')).toBeVisible();
  }

  async goToDashboard() {
    await this.page
      .getByRole('link', { name: 'Dashboard', exact: true })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Current goals' }),
    ).toBeVisible();
  }

  async goToGoals() {
    await this.page.getByRole('link', { name: 'Goals', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'All your goals' }),
    ).toBeVisible();
  }
}
