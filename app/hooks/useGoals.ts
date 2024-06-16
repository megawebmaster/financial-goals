import { useMemo } from 'react';
import type { BudgetGoal } from '@prisma/client';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import type { ClientBudget } from '~/helpers/budgets';
import { useDecryptedList } from '~/hooks/useDecryptedList';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetGoal } from '~/services/budget-goals.client';

const decryptGoals =
  (encryptionKey?: string) =>
  async (goals: BudgetGoal[]): Promise<ClientBudgetGoal[]> => {
    if (!encryptionKey) {
      return [];
    }

    const key = await unlockKey(encryptionKey);

    return await Promise.all(
      goals.map(async (goal: BudgetGoal) => await decryptBudgetGoal(goal, key)),
    );
  };

export const useGoals = (
  budget: ClientBudget | undefined,
  goals: BudgetGoal[],
) => {
  const decryptFn = useMemo(() => decryptGoals(budget?.key), [budget?.key]);

  const { data, loading } = useDecryptedList(goals, decryptFn);

  return {
    goals: data,
    loadingGoals: loading,
  };
};
