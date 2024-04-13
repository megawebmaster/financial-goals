import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';

test('create goal', async ({ budget: page }) => {
  const budgetPage = new BudgetPage(page);
  await expect(page.getByText('No goals yet!')).toBeVisible();

  await budgetPage.addGoal();
  const goalForm = new BudgetGoalForm(page);
  await goalForm.name.fill('First goal');
  await goalForm.amount.fill('1000');
  await goalForm.submit();

  await expect(page.getByText('First goal')).toBeVisible();
});
