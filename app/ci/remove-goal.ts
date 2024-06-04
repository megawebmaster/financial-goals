import { seedBudget, seedGoal, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

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
    requiredAmount: '750',
  });
}

export async function cleanupRemoveGoalTest() {
  const user = await prisma.user.findFirst({
    where: { username: 'remove-goal' },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
