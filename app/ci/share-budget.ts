import {
  removeUserIfNeeded,
  seedBudget,
  seedGoal,
  seedSavings,
  seedUser,
} from '~/ci/helpers';

export async function seedShareBudgetTest(params: string[]) {
  await cleanupShareBudgetTest(params);
  const user = await seedUser(`share-budget-${params[0]}`);
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
    requiredAmount: '750',
  });
  await seedSavings(user, budget, encryptionKey, { amount: '2000' }, [
    goal1,
    goal2,
    goal3,
  ]);
  const user2 = await seedUser(`share-budget-receiver-${params[0]}`);
  await seedBudget(user2, { name: 'First budget' });
}

export async function cleanupShareBudgetTest(params: string[]) {
  await removeUserIfNeeded(`share-budget-${params[0]}`);
  await removeUserIfNeeded(`share-budget-receiver-${params[0]}`);
}
