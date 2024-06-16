import { useDecryptedList } from '~/hooks/useDecryptedList';
import type { ServerBudget } from '~/services/budgets.server';
import { decryptBudget } from '~/services/budgets.client';
import { unlockKey } from '~/services/encryption.client';

const decryptBudgets = async (budgets: ServerBudget[]) => {
  return await Promise.all(
    budgets.map(
      async (budget: ServerBudget) =>
        await decryptBudget(budget, await unlockKey(budget.key)),
    ),
  );
};

export const useBudgets = (budgets: ServerBudget[]) => {
  const { data, decrypting, loading } = useDecryptedList(
    budgets,
    decryptBudgets,
  );

  return {
    budgets: data,
    decryptingBudgets: decrypting,
    loadingBudgets: loading,
  };
};
