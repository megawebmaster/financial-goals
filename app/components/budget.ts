import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetUser } from '@prisma/client';

import { unlockKey } from '~/services/encryption.client';
import { decryptBudget } from '~/services/budgets.client';

const promiseFn: PromiseFn<BudgetUser> = async ({ budget }) =>
  await decryptBudget(budget, await unlockKey(budget.key));

export const Budget = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.budget !== cur.budget,
  },
  'Budget',
);
