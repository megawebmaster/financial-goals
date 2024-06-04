import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetSavingsForm } from './pages/budget-savings-form';
import { LoginForm } from './pages/login-form';

test('add savings, then create goal', async ({ page, withFixture }) => {
  await withFixture('create-savings/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-savings-1');

    const budgetPage = new BudgetPage(page);
    await expect(page.getByText('No goals yet!')).toBeVisible();

    await budgetPage.addSavings();
    const savingsForm = new BudgetSavingsForm(page);
    await savingsForm.pickDate('1');
    await savingsForm.amount.fill('1000');
    await savingsForm.submit();

    await expect(budgetPage.currentSavings).toContainText('1000,00');
    await expect(budgetPage.freeSavings).toContainText('1000,00');

    await budgetPage.addGoal('First goal', '2000');

    await expect(budgetPage.goals.nth(0)).toContainText('50%');
    await expect(budgetPage.currentSavings).toContainText('1000,00');
    await expect(budgetPage.freeSavings).not.toBeAttached();
  });
});

test('add savings, then create multiple goals', async ({
  page,
  withFixture,
}) => {
  await withFixture('create-savings/2', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-savings-2');

    const budgetPage = new BudgetPage(page);
    await expect(page.getByText('No goals yet!')).toBeVisible();

    await budgetPage.addSavings();
    const savingsForm = new BudgetSavingsForm(page);
    await savingsForm.pickDate('1');
    await savingsForm.amount.fill('2000');
    await savingsForm.submit();

    await expect(budgetPage.currentSavings).toContainText('2000');
    await expect(budgetPage.freeSavings).toContainText('2000');

    await budgetPage.addGoal('First goal', '1000');
    await budgetPage.addGoal('Second goal', '2000');

    await expect(budgetPage.goals.nth(0)).toContainText('100%');
    await expect(budgetPage.goals.nth(1)).toContainText('50%');
    await expect(budgetPage.currentSavings).toContainText('2000');
    await expect(budgetPage.freeSavings).not.toBeAttached();
  });
});

test('create goal, then add savings', async ({ page, withFixture }) => {
  await withFixture('create-savings/3', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-savings-3');

    const budgetPage = new BudgetPage(page);
    await expect(page.getByText('No goals yet!')).toBeVisible();

    await budgetPage.addGoal('First goal', '2000');

    await budgetPage.addSavings();
    const savingsForm = new BudgetSavingsForm(page);
    await savingsForm.pickDate('1');
    await savingsForm.amount.fill('1000');
    await savingsForm.submit();

    await expect(budgetPage.goals.nth(0)).toContainText('50%');
    await expect(budgetPage.currentSavings).toContainText('1000');
    await expect(budgetPage.freeSavings).not.toBeAttached();
  });
});

test('create multiple goals, then add savings', async ({
  page,
  withFixture,
}) => {
  await withFixture('create-savings/4', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-savings-4');

    const budgetPage = new BudgetPage(page);
    await expect(page.getByText('No goals yet!')).toBeVisible();

    await budgetPage.addGoal('First goal', '1000');
    await budgetPage.addGoal('Second goal', '2000');

    await budgetPage.addSavings();
    const savingsForm = new BudgetSavingsForm(page);
    await savingsForm.pickDate('1');
    await savingsForm.amount.fill('2000');
    await savingsForm.submit();

    await expect(budgetPage.goals.nth(0)).toContainText('100%');
    await expect(budgetPage.goals.nth(1)).toContainText('50%');
    await expect(budgetPage.currentSavings).toContainText('2000');
    await expect(budgetPage.freeSavings).not.toBeAttached();
  });
});
