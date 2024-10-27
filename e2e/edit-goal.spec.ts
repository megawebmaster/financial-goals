import { expect, test } from './test';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { LoginForm } from './pages/login-form';
import { Layout } from './pages/layout';
import { GoalsPage } from './pages/goals-page';

test('edit goal and recalculate current savings', async ({
  page,
  withFixture,
}) => {
  await withFixture('edit-goal', async () => {
    const form = new LoginForm(page);
    await form.loginAs('edit-goal');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);

    await goalsPage.goToEditGoal('quick', 'First goal');
    const goalForm = new BudgetGoalForm(page);
    await goalForm.name.fill('New goal');
    await goalForm.amount.fill('2000');
    await goalForm.submit();

    await expect(goalsPage.quickGoals.getByText('New goal')).toBeVisible();
    await expect(goalsPage.quickGoals).toHaveCount(2);
    await expect(goalsPage.quickGoals.nth(0)).toContainText('75%');
    await expect(goalsPage.quickGoals.nth(1)).toContainText('0%');
    await expect(goalsPage.longGoals).toHaveCount(1);
    await expect(goalsPage.longGoals.nth(0)).toContainText('67%');
  });
});
