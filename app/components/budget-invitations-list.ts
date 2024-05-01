import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetInvitation } from '@prisma/client';

import type { ClientBudgetInvitation } from '~/helpers/budget-invitations';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetInvitation } from '~/services/budget-invitations.client';

const promiseFn: PromiseFn<ClientBudgetInvitation[]> = ({
  invitations,
  currentUser,
}) =>
  Promise.all(
    invitations.map(
      async (invitation: BudgetInvitation) =>
        await decryptBudgetInvitation(
          invitation,
          await unlockKey(currentUser.privateKey, ['decrypt']),
        ),
    ),
  );

export const BudgetInvitationsList = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.invitations !== cur.invitations,
  },
  'BudgetInvitationsList',
);
