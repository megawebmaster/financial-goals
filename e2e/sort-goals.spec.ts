import { expect, test } from './test';
import { LoginForm } from './pages/login-form';
import { Layout } from './pages/layout';
import { GoalsPage } from './pages/goals-page';

test('sort goals - moving up', async ({ page, withFixture }) => {
  await withFixture('sort-goals/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-1');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);
    await goalsPage.moveGoalUp('quick', 'Second goal');

    await expect(goalsPage.quickGoals.nth(0)).toContainText('Second goal');
  });
});

test('sort goals - moving down', async ({ page, withFixture }) => {
  await withFixture('sort-goals/2', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-2');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);
    await goalsPage.moveGoalDown('quick', 'Second goal');

    await expect(goalsPage.quickGoals.nth(2)).toContainText('Second goal');
  });
});

test('sort goals - update current values', async ({ page, withFixture }) => {
  await withFixture('sort-goals-with-savings/1', async () => {
    const form = new LoginForm(page);
    await form.loginAs('sort-goals-with-savings-1');

    const layout = new Layout(page);
    await layout.goToGoals();

    const goalsPage = new GoalsPage(page);

    await expect(goalsPage.quickGoals.nth(0)).toContainText('100%');
    await expect(goalsPage.quickGoals.nth(1)).toContainText('100%');
    await expect(goalsPage.quickGoals.nth(2)).toContainText('67%');

    await goalsPage.moveGoalDown('quick', 'Second goal');

    await expect(goalsPage.quickGoals.nth(0)).toContainText('100%');
    await expect(goalsPage.quickGoals.nth(1)).toContainText('100%');
    await expect(goalsPage.quickGoals.nth(2)).toContainText('50%');
  });
});
