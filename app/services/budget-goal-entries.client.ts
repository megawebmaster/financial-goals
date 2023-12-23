import type { BudgetGoalEntry } from '@prisma/client';

import { decrypt, encrypt } from '~/services/encryption.client';
import type {
  BudgetGoalWithEntries,
  ClientBudgetGoalEntry,
} from '~/helpers/budget-goals';
import { map, pipe, prop, propEq, reduce, reduced, sortBy } from 'ramda';

export type GoalEntry = {
  goalId: BudgetGoalEntry['goalId'];
  value: number;
};

export const decryptBudgetGoalEntry = async (
  entry: BudgetGoalEntry,
  key: CryptoKey,
): Promise<ClientBudgetGoalEntry> => ({
  ...entry,
  value: parseFloat(await decrypt(entry.value, key)),
});

export const encryptBudgetGoalEntry = async (
  entry: GoalEntry,
  key: CryptoKey,
): Promise<Omit<BudgetGoalEntry, 'userId' | 'id'>> => ({
  ...entry,
  value: await encrypt(entry.value.toString(), key),
});

export const buildGoalsEntriesBuilder =
  (amount: number) => (goals: BudgetGoalWithEntries[]) => {
    // Create entries for each goal we can fill up with the amount added now
    let amountLeft = amount;

    return reduce(
      (entries, goal) => {
        if (amountLeft <= 0) {
          return reduced(entries);
        }

        const missingAmount = goal.requiredAmount - goal.currentAmount;
        const value = missingAmount > amountLeft ? amountLeft : missingAmount;
        amountLeft -= missingAmount;

        return [...entries, { goalId: goal.id, value }];
      },
      [] as GoalEntry[],
      goals,
    );
  };

export const buildGoalsSorting =
  (goalId: number, newPriority: number) =>
  (goals: BudgetGoalWithEntries[]): BudgetGoalWithEntries[] => {
    const currentGoal = goals.find(propEq(goalId, 'id'));

    if (!currentGoal) {
      return [];
    }

    const getPriority = (goal: BudgetGoalWithEntries) => {
      if (
        newPriority > currentGoal.priority &&
        goal.priority >= newPriority &&
        goal.priority < currentGoal.priority
      ) {
        return goal.priority;
      }
      if (
        newPriority < currentGoal.priority &&
        goal.priority < newPriority &&
        goal.priority >= currentGoal.priority
      ) {
        return goal.priority;
      }

      return newPriority > currentGoal.priority
        ? goal.priority - 1
        : goal.priority + 1;
    };

    return pipe(
      map((goal: BudgetGoalWithEntries) => ({
        ...goal,
        priority: goal.id === goalId ? newPriority : getPriority(goal),
      })),
      sortBy(prop('priority')),
    )(goals);
  };
