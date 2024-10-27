import { expect, test } from './test';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { LoginForm } from './pages/login-form';
import { Layout } from './pages/layout';
import { GoalsPage } from './pages/goals-page';
import { BudgetPage } from './pages/budget-page';

test('remove goal', async ({ page, withFixture }) => {
  await withFixture('remove-goal', async () => {
    const form = new LoginForm(page);
    await form.loginAs('remove-goal');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);
    await goalsPage.goToEditGoal('quick', 'First goal');
    const goalForm = new BudgetGoalForm(page);
    await goalForm.deleteGoal();

    await expect(page.getByText('First budget')).toBeVisible();
    await expect(
      goalsPage.quickGoals.getByText('First goal'),
    ).not.toBeAttached();
    await expect(
      goalsPage.longGoals.getByText('First goal'),
    ).not.toBeAttached();
    await expect(goalsPage.quickGoals).toHaveCount(1);
    await expect(goalsPage.longGoals).toHaveCount(1);
  });
});

test('remove goal and return savings', async ({ page, withFixture }) => {
  await withFixture('remove-goal-with-savings', async () => {
    const form = new LoginForm(page);
    await form.loginAs('remove-goal-with-savings');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);
    await goalsPage.goToEditGoal('quick', 'First goal');
    const goalForm = new BudgetGoalForm(page);
    await goalForm.deleteGoal();

    await expect(page.getByText('First budget')).toBeVisible();
    await expect(
      goalsPage.quickGoals.getByText('First goal'),
    ).not.toBeAttached();
    await expect(
      goalsPage.longGoals.getByText('First goal'),
    ).not.toBeAttached();

    await expect(goalsPage.quickGoals.nth(0)).toContainText('100%');
    await expect(goalsPage.longGoals.nth(0)).toContainText('100%');

    await layout.goToDashboard();
    const budgetPage = new BudgetPage(page);
    await expect(budgetPage.currentSavings).toContainText('2000');
    await expect(budgetPage.freeSavings).toContainText('750');
  });
});
