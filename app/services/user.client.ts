import type { User } from '@prisma/client';

import { decrypt, unlockKey } from '~/services/encryption.client';

export const decryptUser = async (user: User): Promise<User> => {
  const key = await unlockKey(user.privateKey, ['decrypt']);

  return {
    ...user,
    preferredLocale: await decrypt(user.preferredLocale, key),
  };
};
