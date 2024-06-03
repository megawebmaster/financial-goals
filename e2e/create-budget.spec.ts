import { expect, test } from './test';
import { BudgetsPage } from './pages/budgets-page';
import { BudgetForm } from './pages/budget-form';

test('create budget', async ({ loggedIn: page }) => {
  const budgetsPage = new BudgetsPage(page);
  await expect(page.getByText('Default')).toBeVisible();

  await budgetsPage.createBudget();
  const budgetForm = new BudgetForm(page);
  await budgetForm.name.fill('First budget');
  await budgetForm.isDefault.click();
  await budgetForm.submit();

  await expect(page.getByText('No goals yet!')).toBeVisible();
  await expect(page.getByText('First budget')).toBeVisible();
});
