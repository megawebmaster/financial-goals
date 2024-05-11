import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetSavingsEntry } from '@prisma/client';

import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetSavingsEntry } from '~/services/budget-savings-entries.client';

const promiseFn: PromiseFn<ClientBudgetSavingsEntry[]> = async ({
  encryptionKey,
  savings,
}) => {
  const key = await unlockKey(encryptionKey);

  return await Promise.all(
    savings.map(
      async (saving: BudgetSavingsEntry) =>
        await decryptBudgetSavingsEntry(saving, key),
    ),
  );
};

export const SavingsList = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.savings !== cur.savings,
  },
  'SavingsList',
);
