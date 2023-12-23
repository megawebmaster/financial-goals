import type { BudgetGoal, BudgetGoalEntry } from '@prisma/client';
import { map, pipe, prop, sum } from 'ramda';

import { decrypt } from '~/services/encryption.client';
import type {
  BudgetGoalWithEntries,
  ClientBudgetGoalEntry,
} from '~/helpers/budget-goals';
import { decryptBudgetGoalEntry } from '~/services/budget-goal-entries.client';

export type GoalWithEntries = BudgetGoal & {
  entries?: BudgetGoalEntry[];
};

const getCurrentAmount = pipe(
  map<ClientBudgetGoalEntry, number>(prop('amount')),
  sum,
);

export const decryptBudgetGoal = async (
  goal: GoalWithEntries,
  key: CryptoKey,
): Promise<BudgetGoalWithEntries> => {
  const entries = await Promise.all(
    goal.entries?.map((entry) => decryptBudgetGoalEntry(entry, key)) || [],
  );
  const requiredAmount = await decrypt(goal.requiredAmount, key);

  return {
    ...goal,
    name: await decrypt(goal.name, key),
    requiredAmount: parseFloat(requiredAmount),
    currentAmount: getCurrentAmount(entries),
    entries,
  };
};
