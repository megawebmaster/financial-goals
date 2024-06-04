import { expect, test } from './test';
import { BudgetForm } from './pages/budget-form';
import { BudgetPage } from './pages/budget-page';
import { LoginForm } from './pages/login-form';

test('create budget', async ({ page, withFixture }) => {
  await withFixture('create-budget', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-budget');

    const budgetForm = new BudgetForm(page);
    await budgetForm.name.fill('First budget');
    await budgetForm.isDefault.click();
    await budgetForm.submit();

    const budgetPage = new BudgetPage(page);
    await expect(budgetPage.goals.getByText('No goals yet!')).toBeVisible();
    await expect(page.getByText('First budget')).toBeVisible();
  });
});
