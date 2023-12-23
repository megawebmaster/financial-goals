import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetGoal } from '@prisma/client';

import { unlockKey } from '~/services/encryption.client';
import { decryptBudgetGoal } from '~/services/budget-goals.client';

const promiseFn: PromiseFn<BudgetGoal> = async ({ encryptionKey, goal }) =>
  await decryptBudgetGoal(goal, await unlockKey(encryptionKey));

export const Goal = createInstance({ promiseFn }, 'Goal');
