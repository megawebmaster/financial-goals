import type { BudgetSavingsEntry } from '@prisma/client';
import { length, map, pipe, sum, uniq } from 'ramda';
import { lightFormat } from 'date-fns';

import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import { decrypt } from '~/services/encryption.client';

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

const sumSavings = pipe(
  map((entry: ClientBudgetSavingsEntry) => entry.amount),
  sum,
);
const countSavingsMonths = pipe(
  map((entry: ClientBudgetSavingsEntry) => lightFormat(entry.date, 'yyyy-MM')),
  uniq,
  length,
);

export const getAverageSavings = (savings: ClientBudgetSavingsEntry[]) =>
  sumSavings(savings) / countSavingsMonths(savings);
