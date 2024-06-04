import { seedBudget, seedUser } from '~/ci/helpers';
import { deleteUser } from '~/services/user.server';
import { prisma } from '~/services/db.server';

export async function seedCreateSavingsTest(params: string[]) {
  const user = await seedUser(`create-savings-${params[0]}`);
  await seedBudget(user);
}

export async function cleanupCreateSavingsTest(params: string[]) {
  const user = await prisma.user.findFirst({
    where: { username: `create-savings-${params[0]}` },
  });

  if (user) {
    await deleteUser(user.id);
  }
}
