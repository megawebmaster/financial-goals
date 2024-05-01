import type { BudgetInvitation } from '@prisma/client';

import type { ClientBudgetInvitation } from '~/helpers/budget-invitations';
import { decrypt } from '~/services/encryption.client';

export const decryptBudgetInvitation = async (
  invitation: BudgetInvitation,
  key: CryptoKey,
): Promise<ClientBudgetInvitation> => {
  const data = JSON.parse(await decrypt(invitation.data, key));
  return {
    ...invitation,
    ...data,
  };
};
