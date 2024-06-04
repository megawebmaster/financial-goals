import { removeUserIfNeeded, seedBudget, seedUser } from '~/ci/helpers';

export async function seedCreateSavingsTest(params: string[]) {
  await cleanupCreateSavingsTest(params);
  const user = await seedUser(`create-savings-${params[0]}`);
  await seedBudget(user, { name: 'First budget' });
}

export async function cleanupCreateSavingsTest(params: string[]) {
  await removeUserIfNeeded(`create-savings-${params[0]}`);
}
