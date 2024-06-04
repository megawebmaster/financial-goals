import { expect, test } from './test';
import { LoginForm } from './pages/login-form';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';

test('create goal', async ({ page, withFixture }) => {
  await withFixture('create-goal', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-goal');

    const budgetPage = new BudgetPage(page);
    await expect(page.getByText('No goals yet!')).toBeVisible();

    await budgetPage.goToNewGoal();
    const goalForm = new BudgetGoalForm(page);
    await goalForm.name.fill('First goal');
    await goalForm.amount.fill('1000');
    await goalForm.submit();

    await expect(budgetPage.goals.getByText('First goal')).toBeVisible();
  });
});
