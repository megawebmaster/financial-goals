import type { Page } from '@playwright/test';
import { expect, test as base } from 'playwright/test';
import { LoginForm } from './pages/login-form';
import { BudgetsPage } from './pages/budgets-page';
import { BudgetForm } from './pages/budget-form';

type Fixtures = {
  account: {
    username: string;
    password: string;
  };
  loggedIn: Page;
  budget: Page;
};
type WorkerFixtures = {
  // account: {
  //   username: string;
  //   password: string;
  // };
};

export { expect };
export const test = base.extend<Fixtures, WorkerFixtures>({
  account: async ({ browser }, use, workerInfo) => {
    const username = 'test-user-' + workerInfo.workerIndex;
    const password = 'very-secure';

    const signUpPage = await browser.newPage();
    await signUpPage.goto('/signup');
    await signUpPage.getByLabel('Username').fill(username);
    await signUpPage.getByLabel('Password').fill(password);
    await signUpPage.getByRole('button', { name: 'Create account!' }).click();
    await expect(
      signUpPage.getByText(`Logged in as: ${username}`),
    ).toBeVisible();
    await signUpPage.close();

    await use({ username, password });

    const deleteAccountPage = await browser.newPage();
    await deleteAccountPage.goto('http://localhost:5173/');
    const form = new LoginForm(deleteAccountPage);
    await form.login.fill(username);
    await form.password.fill(password);
    await form.submit.click();
    await deleteAccountPage
      .getByRole('button', { name: 'Delete account' })
      .click();
    await expect(deleteAccountPage.getByText('Sign up')).toBeVisible();
  },

  loggedIn: async ({ page, account }, use) => {
    await page.goto('/');
    const form = new LoginForm(page);
    await form.login.fill(account.username);
    await form.password.fill(account.password);
    await form.submit.click();
    await expect(
      page.getByText(`Logged in as: ${account.username}`),
    ).toBeVisible();

    await use(page);
  },

  budget: async ({ loggedIn: page }, use) => {
    const budgetsPage = new BudgetsPage(page);
    await budgetsPage.newBudget.click();

    const budgetForm = new BudgetForm(page);
    await budgetForm.name.fill('First budget');
    await budgetForm.submit.click();

    await expect(page.getByText('First budget')).toBeVisible();

    await use(page);
  },
});
