import {
  removeUserIfNeeded,
  seedBudget,
  seedGoal,
  seedUser,
} from '~/ci/helpers';

export async function seedRemoveGoalTest() {
  await cleanupRemoveGoalTest();
  const user = await seedUser('remove-goal');
  const [budget, encryptionKey] = await seedBudget(user, {
    name: 'First budget',
  });
  await seedGoal(user, budget, encryptionKey, {
    name: 'First goal',
    requiredAmount: '1000',
  });
  await seedGoal(user, budget, encryptionKey, {
    name: 'Second goal',
    requiredAmount: '500',
  });
  await seedGoal(user, budget, encryptionKey, {
    name: 'Third goal',
    type: 'long',
    requiredAmount: '750',
  });
}

export async function cleanupRemoveGoalTest() {
  await removeUserIfNeeded('remove-goal');
}
