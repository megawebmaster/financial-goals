import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetGoal } from '@prisma/client';

import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetGoal } from '~/services/budget-goals.client';

const promiseFn: PromiseFn<BudgetGoal[]> = async ({ encryptionKey, goals }) => {
  const key = await unlockKey(encryptionKey);

  return await Promise.all(
    goals.map(async (goal: BudgetGoal) => await decryptBudgetGoal(goal, key)),
  );
};

export const GoalsList = createInstance({ promiseFn }, 'GoalsList');
