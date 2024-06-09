import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';

import type { ClientBudget } from '~/helpers/budgets';
import type { ServerBudget } from '~/services/budgets.server';
import { unlockKey } from '~/services/encryption.client';
import { decryptBudget } from '~/services/budgets.client';

const promiseFn: PromiseFn<ClientBudget[]> = ({ budgets }) =>
  Promise.all(
    budgets.map(
      async (budget: ServerBudget) =>
        await decryptBudget(budget, await unlockKey(budget.key)),
    ),
  );

export const BudgetsList = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.budgets !== cur.budgets,
  },
  'BudgetsList',
);
