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

test('sort goals - update current values', async ({ savings: page }) => {
  const budgetPage = new BudgetPage(page);

  await expect(page.getByRole('listitem').nth(0)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(1)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(2)).toContainText('67%');

  await budgetPage.moveGoalDown('Second goal');

  await expect(page.getByRole('listitem').nth(0)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(1)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(2)).toContainText('50%');
});
