import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class Layout {
  private readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  async logout() {
    await this.logoutButton.click();
    await expect(this.page.getByText('Sign up')).toBeVisible();
  }
}
