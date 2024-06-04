import { seedBudget, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedCreateGoalTest() {
  await cleanupCreateGoalTest();
  const user = await seedUser('create-goal');
  await seedBudget(user, { name: 'First budget' });
}

export async function cleanupCreateGoalTest() {
  const user = await prisma.user.findFirst({
    where: { username: 'create-goal' },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
