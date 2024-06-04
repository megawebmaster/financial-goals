import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { LoginForm } from './pages/login-form';

test('remove goal', async ({ page, withFixture }) => {
  await withFixture('remove-goal', async () => {
    const form = new LoginForm(page);
    await form.loginAs('remove-goal');
    const budgetPage = new BudgetPage(page);

    await budgetPage.goToEditGoal('First goal');
    const goalForm = new BudgetGoalForm(page);
    await goalForm.deleteGoal();

    await expect(page.getByText('First budget')).toBeVisible();
    await expect(budgetPage.goals.getByText('First goal')).not.toBeAttached();
    await expect(budgetPage.goals).toHaveCount(2);
  });
});

test('remove goal and return savings', async ({ page, withFixture }) => {
  await withFixture('remove-goal-with-savings', async () => {
    const form = new LoginForm(page);
    await form.loginAs('remove-goal-with-savings');
    const budgetPage = new BudgetPage(page);

    await budgetPage.goToEditGoal('First goal');
    const goalForm = new BudgetGoalForm(page);
    await goalForm.deleteGoal();

    await expect(page.getByText('First budget')).toBeVisible();
    await expect(budgetPage.goals.getByText('First goal')).not.toBeAttached();

    await expect(budgetPage.currentSavings).toContainText('2000');
    await expect(budgetPage.freeSavings).toContainText('750');
    await expect(budgetPage.goals.nth(0)).toContainText('100%');
    await expect(budgetPage.goals.nth(1)).toContainText('100%');
  });
});
