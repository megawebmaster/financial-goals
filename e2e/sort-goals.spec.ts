import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';

test('sort goals - moving up', async ({ goals: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.moveGoalUp('Second goal');

  await expect(page.getByRole('listitem').nth(0)).toContainText('Second goal');
});

test('sort goals - moving down', async ({ goals: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.moveGoalDown('Second goal');

  await expect(page.getByRole('listitem').nth(2)).toContainText('Second goal');
});
