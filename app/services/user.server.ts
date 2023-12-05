import type { User } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { hash, safeCompare } from '~/services/helpers.server';

export const login = async (
  username: string,
  password: string,
): Promise<User> => {
  const user = await prisma.user.findUniqueOrThrow({ where: { username } });
  const hashedPassword = await hash(password, user.salt);

  if (!safeCompare(user.password, hashedPassword)) {
    throw new Error('Username and/or password is not valid.');
  }

  return user;
};

export const getUser = (id: number): Promise<User> =>
  prisma.user.findUniqueOrThrow({ where: { id } });
