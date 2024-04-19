import type { Browser, Page } from '@playwright/test';
import { expect, test as base } from 'playwright/test';

import { LoginForm } from './pages/login-form';
import { BudgetsPage } from './pages/budgets-page';
import { BudgetForm } from './pages/budget-form';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { BudgetPage } from './pages/budget-page';
import { BudgetSavingsForm } from './pages/budget-savings-form';
import { Layout } from './pages/layout';
import { BudgetShareForm } from './pages/budget-share-form';

type FixtureAccount = {
  username: string;
  password: string;
};

type Fixtures = {
  account: FixtureAccount;
  loggedIn: Page;
  budget: Page;
  goals: Page;
  savings: Page;
};
type WorkerFixtures = {};

export { expect };

const createAccount = async (
  browser: Browser,
  username: string,
): Promise<string> => {
  const password = 'very-secure';

  const signUpPage = await browser.newPage();
  await signUpPage.goto('/signup');
  await signUpPage.getByLabel('Email').fill(username);
  await signUpPage.getByLabel('Password').fill(password);
  await signUpPage.getByRole('button', { name: 'Create account!' }).click();
  await expect(signUpPage.getByText(`Logged in as: ${username}`)).toBeVisible();
  await signUpPage.close();

  return password;
};

const login = async (page: Page, account: FixtureAccount) => {
  const form = new LoginForm(page);
  await form.login.fill(account.username);
  await form.password.fill(account.password);
  await form.submit();
  await expect(
    page.getByText(`Logged in as: ${account.username}`),
  ).toBeVisible();
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  account: async ({ browser, baseURL }, use, workerInfo) => {
    const username = 'test-user-' + workerInfo.workerIndex + '@example.com';
    const password = await createAccount(browser, username);
    await use({ username, password });
  },

  loggedIn: async ({ page, account }, use) => {
    await page.goto('/');
    await login(page, account);
    await use(page);
  },

  budget: async ({ loggedIn: page }, use) => {
    const budgetsPage = new BudgetsPage(page);
    const budgetForm = new BudgetForm(page);

    await budgetsPage.createBudget();
    await budgetForm.name.fill('First budget');
    await budgetForm.submit();

    await expect(page.getByText('First budget')).toBeVisible();

    await use(page);
  },

  goals: async ({ budget: page }, use) => {
    const budgetPage = new BudgetPage(page);
    const goalForm = new BudgetGoalForm(page);

    // Add first goal
    await budgetPage.addGoal();
    await goalForm.name.fill('First goal');
    await goalForm.amount.fill('1000');
    await goalForm.submit();
    await expect(page.getByText('First goal')).toBeVisible();

    // Add second goal
    await budgetPage.addGoal();
    await goalForm.name.fill('Second goal');
    await goalForm.amount.fill('500');
    await goalForm.submit();
    await expect(page.getByText('Second goal')).toBeVisible();

    // Add third goal
    await budgetPage.addGoal();
    await goalForm.name.fill('Third goal');
    await goalForm.amount.fill('750');
    await goalForm.submit();
    await expect(page.getByText('Third goal')).toBeVisible();

    await use(page);
  },

  savings: async ({ goals: page }, use) => {
    const budgetPage = new BudgetPage(page);
    const savingsForm = new BudgetSavingsForm(page);

    // Add first savings value
    await budgetPage.addSavings();
    await savingsForm.amount.fill('2000');
    await savingsForm.submit();

    await use(page);
  },
});
