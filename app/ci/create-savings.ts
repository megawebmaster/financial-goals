import { seedBudget, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedCreateSavingsTest(params: string[]) {
  await cleanupCreateSavingsTest(params);
  const user = await seedUser(`create-savings-${params[0]}`);
  await seedBudget(user, { name: 'First budget' });
}

export async function cleanupCreateSavingsTest(params: string[]) {
  const user = await prisma.user.findFirst({
    where: { username: `create-savings-${params[0]}` },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
