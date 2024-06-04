import { seedBudget, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedCreateGoalTest() {
  const user = await seedUser('create-goal');
  await seedBudget(user);
}

export async function cleanupCreateGoalTest() {
  const user = await prisma.user.findFirst({
    where: { username: 'create-goal' },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
