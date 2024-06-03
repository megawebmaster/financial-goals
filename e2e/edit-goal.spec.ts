import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';

test('edit goal and recalculate current savings', async ({ savings: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.editGoal('First goal');
  const goalForm = new BudgetGoalForm(page);
  await goalForm.name.fill('New goal');
  await goalForm.amount.fill('2000');
  await goalForm.submit();

  await expect(budgetPage.goals.getByText('New goal')).toBeVisible();
  await expect(budgetPage.goals).toHaveCount(3);
  await expect(budgetPage.goals.nth(0)).toContainText('100%');
  await expect(budgetPage.goals.nth(1)).toContainText('0%');
  await expect(budgetPage.goals.nth(2)).toContainText('0%');
});
