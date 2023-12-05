import * as process from 'process';

import { prisma } from '~/services/db.server';
import { seedUsers } from '../seeds/users';

async function seed() {
  await seedUsers();
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
