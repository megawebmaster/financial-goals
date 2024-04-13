import type { BudgetUser } from '@prisma/client';

import { decrypt } from '~/services/encryption.client';
import type { ClientBudget } from '~/helpers/budget-goals';
import type { Budget } from '~/services/budgets.server';

export const decryptBudget = async (
  budget: BudgetUser,
  key: CryptoKey,
): Promise<BudgetUser> => ({
  ...budget,
  name: await decrypt(budget.name, key),
});

export const decryptBudgetWithSavings = async (
  budget: Budget,
  key: CryptoKey,
): Promise<ClientBudget> => {
  const currentSavings = await decrypt(budget.budget.currentSavings, key);

  return {
    ...budget,
    name: await decrypt(budget.name, key),
    currentSavings: parseFloat(currentSavings),
  };
};
