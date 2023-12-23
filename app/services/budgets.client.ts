import type { BudgetUser } from '@prisma/client';
import { decrypt } from '~/services/encryption.client';

export const decryptBudget = async (budget: BudgetUser, key: CryptoKey) => ({
  ...budget,
  name: await decrypt(budget.name, key),
});
