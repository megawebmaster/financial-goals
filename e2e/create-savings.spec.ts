import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetGoalForm } from './pages/budget-goal-form';
import { BudgetSavingsForm } from './pages/budget-savings-form';

test('add savings, then create goal', async ({ budget: page }) => {
  const budgetPage = new BudgetPage(page);
  await expect(page.getByText('No goals yet!')).toBeVisible();

  await budgetPage.addSavings();
  const savingsForm = new BudgetSavingsForm(page);
  await savingsForm.amount.fill('1000');
  await savingsForm.submit.click();

  await budgetPage.addGoal();
  const goalForm = new BudgetGoalForm(page);
  await goalForm.name.fill('First goal');
  await goalForm.amount.fill('2000');
  await goalForm.submit.click();
  await expect(page.getByText('First goal')).toBeVisible();

  await expect(page.getByRole('listitem').nth(0)).toContainText('50%');
});

test('add savings, then create multiple goals', async ({ budget: page }) => {
  const budgetPage = new BudgetPage(page);
  await expect(page.getByText('No goals yet!')).toBeVisible();

  await budgetPage.addSavings();
  const savingsForm = new BudgetSavingsForm(page);
  await savingsForm.amount.fill('2000');
  await savingsForm.submit.click();

  const goalForm = new BudgetGoalForm(page);
  await budgetPage.addGoal();
  await goalForm.name.fill('First goal');
  await goalForm.amount.fill('1000');
  await goalForm.submit.click();
  await expect(page.getByText('First goal')).toBeVisible();

  await budgetPage.addGoal();
  await goalForm.name.fill('Second goal');
  await goalForm.amount.fill('2000');
  await goalForm.submit.click();
  await expect(page.getByText('Second goal')).toBeVisible();

  await expect(page.getByRole('listitem').nth(0)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(1)).toContainText('50%');
});

test('create goal, then add savings', async ({ budget: page }) => {
  const budgetPage = new BudgetPage(page);
  await expect(page.getByText('No goals yet!')).toBeVisible();

  await budgetPage.addGoal();
  const goalForm = new BudgetGoalForm(page);
  await goalForm.name.fill('First goal');
  await goalForm.amount.fill('2000');
  await goalForm.submit.click();
  await expect(page.getByText('First goal')).toBeVisible();

  await budgetPage.addSavings();
  const savingsForm = new BudgetSavingsForm(page);
  await savingsForm.amount.fill('1000');
  await savingsForm.submit.click();

  await expect(page.getByRole('listitem').nth(0)).toContainText('50%');
});

test('create multiple goals, then add savings', async ({ budget: page }) => {
  const budgetPage = new BudgetPage(page);
  await expect(page.getByText('No goals yet!')).toBeVisible();

  const goalForm = new BudgetGoalForm(page);
  await budgetPage.addGoal();
  await goalForm.name.fill('First goal');
  await goalForm.amount.fill('1000');
  await goalForm.submit.click();
  await expect(page.getByText('First goal')).toBeVisible();

  await budgetPage.addGoal();
  await goalForm.name.fill('Second goal');
  await goalForm.amount.fill('2000');
  await goalForm.submit.click();
  await expect(page.getByText('Second goal')).toBeVisible();

  await budgetPage.addSavings();
  const savingsForm = new BudgetSavingsForm(page);
  await savingsForm.amount.fill('2000');
  await savingsForm.submit.click();

  await expect(page.getByRole('listitem').nth(0)).toContainText('100%');
  await expect(page.getByRole('listitem').nth(1)).toContainText('50%');
});