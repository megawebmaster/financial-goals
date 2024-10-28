import {
  removeUserIfNeeded,
  seedBudget,
  seedGoal,
  seedSavings,
  seedUser,
} from '~/ci/helpers';

export async function seedRemoveGoalWithSavingsTest() {
  await cleanupRemoveGoalWithSavingsTest();
  const user = await seedUser('remove-goal-with-savings');
  const [budget, encryptionKey] = await seedBudget(user, {
    name: 'First budget',
  });
  const goal1 = await seedGoal(user, budget, encryptionKey, {
    name: 'First goal',
    requiredAmount: '1000',
  });
  const goal2 = await seedGoal(user, budget, encryptionKey, {
    name: 'Second goal',
    requiredAmount: '500',
  });
  const goal3 = await seedGoal(user, budget, encryptionKey, {
    name: 'Third goal',
    type: 'long',
    requiredAmount: '750',
  });
  await seedSavings(user, budget, encryptionKey, { amount: '2000' }, [
    goal1,
    goal2,
    goal3,
  ]);
}

export async function cleanupRemoveGoalWithSavingsTest() {
  await removeUserIfNeeded('remove-goal-with-savings');
}
