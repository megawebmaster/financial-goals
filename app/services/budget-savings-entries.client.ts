import type { BudgetSavingsEntry } from '@prisma/client';
import { defaultTo, length, map, pipe, sum, uniq } from 'ramda';
import { lightFormat } from 'date-fns';

import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import { decrypt } from '~/services/encryption.client';

export const decryptBudgetSavingsEntry = async (
  entry: BudgetSavingsEntry,
  key: CryptoKey,
): Promise<ClientBudgetSavingsEntry> => {
  return {
    ...entry,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
    amount: parseFloat(await decrypt(entry.amount, key)),
  };
};

const sumSavings = pipe(
  map((entry: ClientBudgetSavingsEntry) => entry.amount),
  sum,
);
const countSavingsMonths = pipe(
  map((entry: ClientBudgetSavingsEntry) =>
    lightFormat(entry.createdAt, 'yyyy-MM'),
  ),
  uniq,
  length,
);

export const getAverageSavings = (savings: ClientBudgetSavingsEntry[]) =>
  defaultTo(0, sumSavings(savings) / countSavingsMonths(savings));
