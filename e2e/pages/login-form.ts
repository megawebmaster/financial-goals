import type { Locator, Page } from 'playwright/test';
import { expect } from '../test';

export class LoginForm {
  public readonly login: Locator;
  public readonly password: Locator;

  constructor(private readonly page: Page) {
    this.login = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
  }

  goto() {
    return this.page.goto('/login');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Login' }).click();
  }

  async loginAs(username: string) {
    await this.goto();
    await this.login.fill(`${username}@example.com`);
    await this.password.fill('test-password-1234');
    await this.submit();
    await expect(this.page.getByText('Toggle user menu')).toBeVisible();
  }
}
