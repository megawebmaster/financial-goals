import type { User } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { generateSalt, hash, safeCompare } from '~/services/helpers.server';
import {
  exportPublicKey,
  generateKeyMaterial,
  generatePKI,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';

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

export const createUser = async (
  username: string,
  password: string,
): Promise<User> => {
  const salt = generateSalt();
  const hashed = await hash(password, salt);

  const user = await prisma.user.findFirst({ where: { username } });

  if (user) {
    throw new Error('User already exists!');
  }

  const pki = await generatePKI();
  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial(password),
    salt,
  );

  return prisma.user.create({
    data: {
      username,
      password: hashed,
      salt,
      publicKey: await exportPublicKey(pki.publicKey),
      privateKey: await lockKey(wrappingKey, pki.privateKey),
    },
  });
};

export const deleteUser = (userId: number) =>
  prisma.user.delete({ where: { id: userId } });
