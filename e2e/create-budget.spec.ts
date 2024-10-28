import { expect, test } from './test';
import { BudgetForm } from './pages/budget-form';
import { LoginForm } from './pages/login-form';

test('create budget', async ({ page, withFixture }) => {
  await withFixture('create-budget', async () => {
    const form = new LoginForm(page);
    await form.loginAs('create-budget');

    const budgetForm = new BudgetForm(page);
    await budgetForm.name.fill('First budget');
    await budgetForm.selectCurrency('Polski Złoty');
    await budgetForm.submit();

    await expect(page.getByText('No goals yet!')).toBeVisible();
    await expect(page.getByText('Your budget: First budget')).toBeVisible();
  });
});
