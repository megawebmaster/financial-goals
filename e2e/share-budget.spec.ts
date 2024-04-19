import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetShareForm } from './pages/budget-share-form';

test('share budget', async ({ savings: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.share();
  const shareForm = new BudgetShareForm(page);
  await shareForm.username.fill('test2@example.com');
  await shareForm.submit();

  await expect(page.getByText('First budget')).toBeVisible();
  // TODO: Add a test for a correct notification
});
