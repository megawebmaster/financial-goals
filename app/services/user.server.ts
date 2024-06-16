import type { User } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { generateSalt, hash, safeCompare } from '~/services/helpers.server';
import {
  exportKey,
  generateKeyMaterial,
  generatePKI,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';

export class InvalidUsernamePasswordError extends Error {}

export const login = async (email: string, password: string): Promise<User> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });
  const hashedPassword = await hash(password, user.salt);

  if (!safeCompare(user.password, hashedPassword)) {
    throw new InvalidUsernamePasswordError();
  }

  return user;
};

export const getUser = (id: number): Promise<User> =>
  prisma.user.findUniqueOrThrow({ where: { id } });

export class UserExistsError extends Error {}

export const createUser = async (
  username: string,
  email: string,
  password: string,
): Promise<User> => {
  const salt = generateSalt();
  const hashed = await hash(password, salt);

  const user = await prisma.user.findFirst({ where: { email } });

  if (user) {
    throw new UserExistsError();
  }

  const pki = await generatePKI();
  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial(password),
    salt,
  );

  return prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      salt,
      publicKey: await exportKey(pki.publicKey),
      privateKey: await lockKey(wrappingKey, pki.privateKey),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
};

export const deleteUser = (userId: number) =>
  prisma.user.delete({ where: { id: userId } });

export const getUserPK = async (email: string): Promise<string> => {
  const user = await prisma.user.findFirstOrThrow({
    where: { email },
  });

  return user.publicKey;
};
