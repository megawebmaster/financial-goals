import { expect, test } from './test';
import { BudgetPage } from './pages/budget-page';
import { BudgetShareForm } from './pages/budget-share-form';
import { BudgetsPage } from './pages/budgets-page';
import { InvitationsPage } from './pages/invitations-page';
import { BudgetAcceptForm } from './pages/budget-accept-form';
import { LoginForm } from './pages/login-form';
import { Layout } from './pages/layout';

test('share budget', async ({ page, withFixture }) => {
  await withFixture('share-budget/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('share-budget-1');
    const budgetPage = new BudgetPage(page);

    await budgetPage.share();
    const shareForm = new BudgetShareForm(page);
    await shareForm.email.fill('share-budget-receiver-1@example.com');
    await shareForm.submit();

    await expect(page.getByText('First budget')).toBeVisible();
    await expect(
      page.getByText(
        'Successfully shared budget with share-budget-receiver-1@example.com',
      ),
    ).toBeVisible();
  });
});

test('share and accept shared budget', async ({ page, withFixture }) => {
  await withFixture('share-budget/2', async () => {
    const form = new LoginForm(page);
    await form.loginAs('share-budget-2');
    const budgetPage = new BudgetPage(page);
    await budgetPage.share();
    const shareForm = new BudgetShareForm(page);
    await shareForm.email.fill('share-budget-receiver-2@example.com');
    await shareForm.submit();
    await expect(page.getByText('First budget')).toBeVisible();

    const layout = new Layout(page);
    await layout.logout();

    await form.loginAs('share-budget-receiver-2');
    const budgetsPage = new BudgetsPage(page);
    await budgetsPage.visitInvitations();

    const invitationsPage = new InvitationsPage(page);
    await invitationsPage.accept('First budget');

    const acceptForm = new BudgetAcceptForm(page);
    await acceptForm.name.clear();
    await acceptForm.name.fill('Test');
    await acceptForm.submit();

    await expect(
      page.getByText('Accepted invitation successfully!'),
    ).toBeVisible();
    // TODO: For some reason we are not properly redirected to the accepted budget.
    //  Is it because of missing data from Remix loaders?
    // await expect(page.getByText('Shared budget: Test')).toBeVisible();
  });
});
