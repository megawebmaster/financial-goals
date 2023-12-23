import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';

import { unlockKey } from '~/services/encryption.client';
import type { GoalWithEntries } from '~/services/budget-goals.client';
import { decryptBudgetGoal } from '~/services/budget-goals.client';
import type { BudgetGoalWithEntries } from '~/helpers/budget-goals';

const promiseFn: PromiseFn<BudgetGoalWithEntries[]> = async ({
  encryptionKey,
  goals,
}) => {
  const key = await unlockKey(encryptionKey);

  return await Promise.all(
    goals.map(
      async (goal: GoalWithEntries) => await decryptBudgetGoal(goal, key),
    ),
  );
};

export const GoalsList = createInstance({ promiseFn }, 'GoalsList');
