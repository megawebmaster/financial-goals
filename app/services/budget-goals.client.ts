import type { BudgetGoal } from '@prisma/client';
import { decrypt } from '~/services/encryption.client';

export const decryptBudgetGoal = async (
  goal: BudgetGoal,
  key: CryptoKey,
): Promise<BudgetGoal> => ({
  ...goal,
  name: await decrypt(goal.name, key),
  requiredAmount: await decrypt(goal.requiredAmount, key),
});
