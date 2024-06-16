import { useMemo } from 'react';
import type { BudgetInvitation, User } from '@prisma/client';

import type { ClientBudgetInvitation } from '~/helpers/budget-invitations';
import { useDecryptedList } from '~/hooks/useDecryptedList';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetInvitation } from '~/services/budget-invitations.client';

const decryptInvitations = (privateKey: string) => {
  return async (
    invitations: BudgetInvitation[],
  ): Promise<ClientBudgetInvitation[]> => {
    const key = await unlockKey(privateKey, ['decrypt']);

    return Promise.all(
      invitations.map(
        async (invitation) => await decryptBudgetInvitation(invitation, key),
      ),
    );
  };
};

export const useBudgetInvitations = (
  user: User,
  invitations: BudgetInvitation[],
) => {
  const decryptFn = useMemo(
    () => decryptInvitations(user.privateKey),
    [user.privateKey],
  );

  const { data, loading } = useDecryptedList(invitations, decryptFn);

  return {
    invitations: data,
    loadingInvitations: loading,
  };
};
