import { seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedCreateBudgetTest() {
  await cleanupCreateBudgetTest();
  await seedUser('create-budget');
}

export async function cleanupCreateBudgetTest() {
  const user = await prisma.user.findFirst({
    where: { username: 'create-budget' },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
