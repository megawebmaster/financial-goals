import { removeUserIfNeeded, seedBudget, seedUser } from '~/ci/helpers';

export async function seedCreateGoalTest() {
  await cleanupCreateGoalTest();
  const user = await seedUser('create-goal');
  await seedBudget(user, { name: 'First budget' });
}

export async function cleanupCreateGoalTest() {
  await removeUserIfNeeded('create-goal');
}
