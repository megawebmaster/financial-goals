import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { LoginForm } from './pages/login-form';

test('sort goals - moving up', async ({ page, withFixture }) => {
  await withFixture('sort-goals/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-1');
    const budgetPage = new BudgetPage(page);

    await budgetPage.moveGoalUp('Second goal');

    await expect(budgetPage.goals.nth(0)).toContainText('Second goal');
  });
});

test('sort goals - moving down', async ({ page, withFixture }) => {
  await withFixture('sort-goals/2', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-2');
    const budgetPage = new BudgetPage(page);

    await budgetPage.moveGoalDown('Second goal');

    await expect(budgetPage.goals.nth(2)).toContainText('Second goal');
  });
});

test('sort goals - update current values', async ({ page, withFixture }) => {
  await withFixture('sort-goals-with-savings/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-with-savings-1');
    const budgetPage = new BudgetPage(page);

    await expect(budgetPage.goals.nth(0)).toContainText('100%');
    await expect(budgetPage.goals.nth(1)).toContainText('100%');
    await expect(budgetPage.goals.nth(2)).toContainText('67%');

    await budgetPage.moveGoalDown('Second goal');

    await expect(budgetPage.goals.nth(0)).toContainText('100%');
    await expect(budgetPage.goals.nth(1)).toContainText('100%');
    await expect(budgetPage.goals.nth(2)).toContainText('50%');
  });
});
