import { expect, test } from './test';
import { LoginForm } from './pages/login-form';
import { Layout } from './pages/layout';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { GoalsPage } from './pages/goals-page';

test('create goal', async ({ page, withFixture }) => {
  await withFixture('create-goal', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-goal');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);
    await expect(goalsPage.quickGoals.getByText('No goals yet!')).toBeVisible();
    await expect(goalsPage.longGoals.getByText('No goals yet!')).toBeVisible();

    await goalsPage.goToNewGoal();
    const goalForm = new BudgetGoalForm(page);
    await goalForm.selectType('Quick goal');
    await goalForm.name.fill('First goal');
    await goalForm.amount.fill('1000');
    await goalForm.submit();

    await expect(goalsPage.quickGoals.getByText('First goal')).toBeVisible();
  });
});
