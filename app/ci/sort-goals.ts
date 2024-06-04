import {
  removeUserIfNeeded,
  seedBudget,
  seedGoal,
  seedUser,
} from '~/ci/helpers';

export async function seedSortGoalsTest(params: string[]) {
  await cleanupSortGoalsTest(params);
  const user = await seedUser(`sort-goals-${params[0]}`);
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
    requiredAmount: '750',
  });
}

export async function cleanupSortGoalsTest(params: string[]) {
  await removeUserIfNeeded(`sort-goals-${params[0]}`);
}
