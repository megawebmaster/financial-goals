import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';

import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetGoal } from '~/services/budget-goals.client';
import type { BudgetGoalWithEntries } from '~/helpers/budget-goals';

const promiseFn: PromiseFn<BudgetGoalWithEntries> = async ({
  encryptionKey,
  goal,
}) => await decryptBudgetGoal(goal, await unlockKey(encryptionKey));

export const Goal = createInstance(
  {
    promiseFn,
    watchFn: (prev, cur) => prev.goal !== cur.goal,
  },
  'Goal',
);
