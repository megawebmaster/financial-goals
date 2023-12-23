import type { BudgetGoalEntry } from '@prisma/client';

import { decrypt, encrypt } from '~/services/encryption.client';
import type { ClientBudgetGoalEntry } from '~/helpers/budget-goals';

export type GoalEntry = {
  goalId: BudgetGoalEntry['goalId'];
  value: number;
};

export const decryptBudgetGoalEntry = async (
  entry: BudgetGoalEntry,
  key: CryptoKey,
): Promise<ClientBudgetGoalEntry> => ({
  ...entry,
  value: parseFloat(await decrypt(entry.value, key)),
});

export const encryptBudgetGoalEntry = async (
  entry: GoalEntry,
  key: CryptoKey,
): Promise<Omit<BudgetGoalEntry, 'userId' | 'id'>> => ({
  ...entry,
  value: await encrypt(entry.value.toString(), key),
});
