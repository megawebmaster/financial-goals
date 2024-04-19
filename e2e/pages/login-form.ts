import type { Locator, Page } from 'playwright/test';

export class LoginForm {
  public readonly login: Locator;
  public readonly password: Locator;

  constructor(private readonly page: Page) {
    this.login = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
  }

  submit() {
    return this.page.getByRole('button', { name: 'Sign in!' }).click();
  }
}
