import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';

import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetWithSavings } from '~/services/budgets.client';
import type { ClientBudget } from '~/helpers/budgets';

const promiseFn: PromiseFn<ClientBudget> = async ({ budget }) =>
  await decryptBudgetWithSavings(budget, await unlockKey(budget.key));

export const Budget = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.budget !== cur.budget,
  },
  'Budget',
);
