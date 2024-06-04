import { seedBudget, seedGoal, seedSavings, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedEditGoalTest() {
  const user = await seedUser('edit-goal');
  const [budget, encryptionKey] = await seedBudget(user, {
    name: 'Test budget 1',
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
}

export async function cleanupEditGoalTest() {
  const user = await prisma.user.findFirst({
    where: { username: 'edit-goal' },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
