import type { Locator, Page } from 'playwright/test';

export class LoginForm {
  public readonly login: Locator;
  public readonly password: Locator;
  public readonly submit: Locator;

  constructor(page: Page) {
    this.login = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in!' });
  }
}
