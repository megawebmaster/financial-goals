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
  email: string;
  password: string;
};

type Fixtures = {
  withFixture: (
    testName: string,
    example: () => Promise<void>,
  ) => Promise<void>;
  account: FixtureAccount;
  account2: FixtureAccount;
  loggedIn: Page;
  budget: Page;
  goals: Page;
  savings: Page;
  sharedBudget: Page;
};
type WorkerFixtures = {};

export { expect };

const createAccount = async (
  browser: Browser,
  username: string,
): Promise<FixtureAccount> => {
  const email = `${username}@example.com`;
  const password = 'very-secure-long-password';

  const signUpPage = await browser.newPage();
  await signUpPage.goto('/signup');
  await signUpPage.getByLabel('Your name').fill(username);
  await signUpPage.getByLabel('Email').fill(email);
  await signUpPage.getByLabel('Password').fill(password);
  await signUpPage.getByRole('button', { name: 'Create an account' }).click();

  const userMenu = signUpPage.getByText('Toggle user menu');
  await expect(userMenu).toBeVisible();
  await userMenu.click();
  await expect(signUpPage.getByText(username)).toBeVisible();
  await signUpPage.close();

  return { username, email, password };
};

const deleteAccount = async (
  browser: Browser,
  baseURL: string | undefined,
  account: FixtureAccount,
) => {
  const deleteAccountPage = await browser.newPage();
  await deleteAccountPage.goto(baseURL || 'http://127.0.0.1:5173');
  const form = new LoginForm(deleteAccountPage);
  await form.login.fill(account.email);
  await form.password.fill(account.password);
  await form.submit();

  const userMenu = deleteAccountPage.getByText('Toggle user menu');
  await expect(userMenu).toBeVisible();
  await userMenu.click();
  await deleteAccountPage.getByRole('menuitem', { name: 'Settings' }).click();
  await deleteAccountPage
    .getByRole('button', { name: 'Delete my account' })
    .click();
  await deleteAccountPage
    .getByRole('button', { name: 'Yes, delete my account' })
    .click();
  await expect(deleteAccountPage.getByText('Sign up')).toBeVisible();
};

const login = async (page: Page, account: FixtureAccount) => {
  const form = new LoginForm(page);
  await form.login.fill(account.email);
  await form.password.fill(account.password);
  await form.submit();

  const userMenu = page.getByText('Toggle user menu');
  await expect(userMenu).toBeVisible();
  await userMenu.click();
  await expect(page.getByText(account.username)).toBeVisible();
  await page.getByRole('document').click();
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  withFixture: async ({ page }, use) => {
    await use(async (testName: string, example: () => Promise<void>) => {
      await page.goto(`/fixtures/setup/${testName}`);
      await example();
      await page.goto(`/fixtures/cleanup/${testName}`);
    });
  },

  account: async ({ browser, baseURL }, use) => {
    const { workerIndex, parallelIndex } = test.info();
    const username = `test-user-${workerIndex}-${parallelIndex}`;
    const account = await createAccount(browser, username);
    await use(account);
    await deleteAccount(browser, baseURL, account);
  },

  account2: async ({ browser, baseURL }, use) => {
    const { workerIndex, parallelIndex } = test.info();
    const username = `secondary-user-${workerIndex}-${parallelIndex}`;
    const account = await createAccount(browser, username);
    await use(account);
    await deleteAccount(browser, baseURL, account);
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
    await budgetForm.isDefault.click();
    await budgetForm.submit();

    await expect(page.getByText('First budget')).toBeVisible();

    await use(page);
  },

  goals: async ({ budget: page }, use) => {
    const budgetPage = new BudgetPage(page);
    const goalForm = new BudgetGoalForm(page);

    // Add first goal
    await budgetPage.goToNewGoal();
    await goalForm.name.fill('First goal');
    await goalForm.amount.fill('1000');
    await goalForm.submit();
    await expect(
      page.getByLabel('All goals').getByText('First goal'),
    ).toBeVisible();

    // Add second goal
    await budgetPage.goToNewGoal();
    await goalForm.name.fill('Second goal');
    await goalForm.amount.fill('500');
    await goalForm.submit();
    await expect(
      page.getByLabel('All goals').getByText('Second goal'),
    ).toBeVisible();

    // Add third goal
    await budgetPage.goToNewGoal();
    await goalForm.name.fill('Third goal');
    await goalForm.amount.fill('750');
    await goalForm.submit();
    await expect(
      page.getByLabel('All goals').getByText('Third goal'),
    ).toBeVisible();

    await use(page);
  },

  savings: async ({ goals: page }, use) => {
    const budgetPage = new BudgetPage(page);
    const savingsForm = new BudgetSavingsForm(page);

    // Add first savings value
    await budgetPage.addSavings();
    await savingsForm.pickDate('1');
    await savingsForm.amount.fill('2000');
    await savingsForm.submit();

    await use(page);
  },

  sharedBudget: async ({ savings: page, account2 }, use) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.share();
    const shareForm = new BudgetShareForm(page);
    await shareForm.email.fill(account2.email);
    await shareForm.submit();
    await expect(page.getByText('First budget')).toBeVisible();

    const layout = new Layout(page);
    await layout.logout();
    await login(page, account2);

    await use(page);
  },
});
