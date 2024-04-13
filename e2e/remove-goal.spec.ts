import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';

test('remove goal', async ({ goals: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.editGoal('First goal');
  const goalForm = new BudgetGoalForm(page);
  await goalForm.deleteGoal();

  await expect(page.getByText('Your budget: First budget')).toBeVisible();
  await expect(page.getByText('First goal')).not.toBeAttached();
  await expect(page.getByRole('listitem')).toHaveCount(2);
});

test('remove goal and return savings', async ({ savings: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.editGoal('First goal');
  const goalForm = new BudgetGoalForm(page);
  await goalForm.deleteGoal();

  await expect(page.getByText('Your budget: First budget')).toBeVisible();
  await expect(page.getByText('First goal')).not.toBeAttached();

  await expect(budgetPage.currentSavings).toContainText('2000');
  await expect(budgetPage.freeSavings).toContainText('750');
  await expect(page.getByRole('listitem').nth(0)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(1)).toContainText('100%');
});
