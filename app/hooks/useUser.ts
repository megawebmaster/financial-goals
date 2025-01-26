import { useCallback } from 'react';
import type { User } from '@prisma/client';

import { useDecryptedItem } from '~/hooks/useDecryptedItem';
import { decryptUser } from '~/services/user.client';

export const useUser = (user: User) => {
  const decryptFn = useCallback(() => decryptUser(user), [user]);
  const { data, decrypting, loading } = useDecryptedItem<User>(decryptFn);

  return {
    user: data,
    decryptingUser: decrypting,
    loadingUser: loading,
  };
};
