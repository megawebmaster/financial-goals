import { useEffect, useState } from 'react';
import type { User } from '@prisma/client';

import { buildWrappingKey } from '~/services/encryption.client';

export const ENCRYPTION_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
};

export const useEncryption = (user?: User) => {
  const [status, setStatus] = useState(ENCRYPTION_STATUS.LOADING);
  useEffect(() => {
    if (!user?.salt) {
      return;
    }

    buildWrappingKey(user.salt)
      .then(() => setStatus(ENCRYPTION_STATUS.READY))
      .catch((e) => {
        setStatus(ENCRYPTION_STATUS.ERROR);
        console.error(`Unable to build wrapping key: ${(e as Error).message}`);
        // TODO: Properly show the error and log out
      });
  }, [user?.salt]);

  return status;
};
