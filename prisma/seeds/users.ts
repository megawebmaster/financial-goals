import { prisma } from '~/services/db.server';
import { generateSalt, hash } from '~/services/helpers.server';

export async function seedUsers() {
  const salt = generateSalt();
  await prisma.user.create({
    data: {
      username: 'test',
      password: await hash('test', salt),
      salt,
    },
  });
}
