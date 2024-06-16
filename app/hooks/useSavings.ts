import { useMemo } from 'react';
import type { BudgetSavingsEntry } from '@prisma/client';

import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import type { ClientBudget } from '~/helpers/budgets';
import { useDecryptedList } from '~/hooks/useDecryptedList';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetSavingsEntry } from '~/services/budget-savings-entries.client';

const decryptSavings =
  (encryptionKey?: string) =>
  async (
    savings: BudgetSavingsEntry[],
  ): Promise<ClientBudgetSavingsEntry[]> => {
    if (!encryptionKey) {
      return [];
    }

    const key = await unlockKey(encryptionKey);

    return await Promise.all(
      savings.map(
        async (saving: BudgetSavingsEntry) =>
          await decryptBudgetSavingsEntry(saving, key),
      ),
    );
  };

export const useSavings = (
  budget: ClientBudget | undefined,
  savings: BudgetSavingsEntry[],
) => {
  const decryptFn = useMemo(() => decryptSavings(budget?.key), [budget?.key]);

  const { data, loading } = useDecryptedList(savings, decryptFn);

  return {
    savings: data,
    loadingSavings: loading,
  };
};
