import { decrypt } from '~/services/encryption.client';
import type { ClientBudget } from '~/helpers/budgets';
import type { ServerBudget } from '~/services/budgets.server';

export const decryptBudget = async (
  budget: ServerBudget,
  key: CryptoKey,
): Promise<ClientBudget> => {
  const currentSavings = await decrypt(budget.budget.currentSavings, key);
  const freeSavings = await decrypt(budget.budget.freeSavings, key);
  const currency = await decrypt(budget.budget.currency, key);

  return {
    ...budget,
    currency,
    name: await decrypt(budget.name, key),
    currentSavings: parseFloat(currentSavings),
    freeSavings: parseFloat(freeSavings),
    createdAt: new Date(budget.createdAt),
    updatedAt: new Date(budget.updatedAt),
  };
};
