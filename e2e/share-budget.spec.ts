import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetShareForm } from './pages/budget-share-form';
import { BudgetsPage } from './pages/budgets-page';
import { InvitationsPage } from './pages/invitations-page';
import { BudgetAcceptForm } from './pages/budget-accept-form';

test('share budget', async ({ savings: page }) => {
  const budgetPage = new BudgetPage(page);

  await budgetPage.share();
  const shareForm = new BudgetShareForm(page);
  await shareForm.username.fill('test2@example.com');
  await shareForm.submit();

  await expect(page.getByText('First budget')).toBeVisible();
  // TODO: Add a test for a correct notification
});

test('accept shared budget', async ({ sharedBudget: page }) => {
  const budgetsPage = new BudgetsPage(page);
  await budgetsPage.visitInvitations();

  const invitationsPage = new InvitationsPage(page);
  await invitationsPage.accept('First budget');

  const acceptForm = new BudgetAcceptForm(page);
  await acceptForm.name.clear();
  await acceptForm.name.fill('Test');
  await acceptForm.submit();

  await expect(page.getByText('Shared budget: Test')).toBeVisible();
});
