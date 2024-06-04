import { removeUserIfNeeded, seedUser } from '~/ci/helpers';

export async function seedCreateBudgetTest() {
  await cleanupCreateBudgetTest();
  await seedUser('create-budget');
}

export async function cleanupCreateBudgetTest() {
  await removeUserIfNeeded('create-budget');
}
