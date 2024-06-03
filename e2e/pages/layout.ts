import type { Page } from 'playwright/test';
import { expect } from '../test';

export class Layout {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly page: Page) {}

  async logout() {
    await this.page.getByRole('button', { name: 'Toggle user menu' }).click();
    await this.page.getByRole('button', { name: 'Log out' }).click();
    await expect(this.page.getByText('Sign up')).toBeVisible();
  }
}
