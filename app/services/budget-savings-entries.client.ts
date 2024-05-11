import type { BudgetSavingsEntry } from '@prisma/client';
import { map, pipe, sum } from 'ramda';

import { decrypt, encrypt } from '~/services/encryption.client';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';

export const decryptBudgetSavingsEntry = async (
  entry: BudgetSavingsEntry,
  key: CryptoKey,
): Promise<ClientBudgetSavingsEntry> => {
  return {
    ...entry,
    date: new Date(entry.date),
    amount: parseFloat(await decrypt(entry.amount, key)),
  };
};

export const getAverageSavings = (savings: ClientBudgetSavingsEntry[]) =>
  pipe(
    map((entry: ClientBudgetSavingsEntry) => entry.amount),
    sum,
  )(savings) / savings.length;

export const encryptBudgetSavingsEntry = async (
  date: Date,
  amount: number,
  key: CryptoKey,
): Promise<string> =>
  await encrypt(JSON.stringify({ amount, date: date.toISOString() }), key);
