import type { BudgetSavingsEntry } from '@prisma/client';

import { decrypt, encrypt } from '~/services/encryption.client';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';

export const decryptBudgetSavingsEntry = async (
  entry: BudgetSavingsEntry,
  key: CryptoKey,
): Promise<ClientBudgetSavingsEntry> => {
  const value = JSON.parse(await decrypt(entry.value, key));

  return {
    ...entry,
    date: value.date,
    amount: value.amount,
  };
};

export const encryptBudgetSavingsEntry = async (
  date: Date,
  amount: number,
  key: CryptoKey,
): Promise<string> =>
  await encrypt(JSON.stringify({ amount, date: date.toISOString() }), key);
