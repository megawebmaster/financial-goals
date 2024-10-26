import type { User } from '@prisma/client';

import { useDecryptedItem } from '~/hooks/useDecryptedItem';
import { decryptUser } from '~/services/user.client';

export const useUser = (user: User) => {
  const { data, decrypting, loading } = useDecryptedItem<User>(() =>
    decryptUser(user),
  );

  return {
    user: data,
    decryptingUser: decrypting,
    loadingUser: loading,
  };
};
