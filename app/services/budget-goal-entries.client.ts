import type { BudgetGoalEntry } from '@prisma/client';

import { decrypt, encrypt } from '~/services/encryption.client';
import type { ClientBudgetGoalEntry } from '~/helpers/budget-goals';

export const decryptBudgetGoalEntry = async (
  entry: BudgetGoalEntry,
  key: CryptoKey,
): Promise<ClientBudgetGoalEntry> => {
  const value = JSON.parse(await decrypt(entry.value, key));

  return {
    ...entry,
    date: value.date,
    amount: value.amount,
  };
};
export const encryptBudgetGoalEntry = async (
  date: Date,
  amount: number,
  key: CryptoKey,
): Promise<string> =>
  await encrypt(JSON.stringify({ amount, date: date.toISOString() }), key);
