import { map, pipe, prop, propEq, reduce, sortBy } from 'ramda';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getCurrentAmount } from '~/helpers/budget-goals';

export const buildGoalsFiller =
  (amount: number) =>
  (goals: ClientBudgetGoal[]): ClientBudgetGoal[] => {
    // Create entries for each goal we can fill up with the amount added now
    let amountLeft = amount;

    return reduce(
      (entries, goal) => {
        const currentAmount = getCurrentAmount(amountLeft, goal.requiredAmount);
        amountLeft -= currentAmount;

        return [...entries, { ...goal, currentAmount }];
      },
      [] as ClientBudgetGoal[],
      goals,
    );
  };

export const buildGoalsSorting =
  (goalId: number, newPriority: number) =>
  (goals: ClientBudgetGoal[]): ClientBudgetGoal[] => {
    const currentGoal = goals.find(propEq(goalId, 'id'));

    if (!currentGoal) {
      return [];
    }

    const currentPriority = currentGoal.priority;
    const movingDown = newPriority > currentPriority;

    const getPriority = (goal: ClientBudgetGoal) => {
      if (movingDown) {
        if (goal.priority < currentPriority || goal.priority > newPriority) {
          return goal.priority;
        }

        return goal.priority - 1;
      }

      if (goal.priority > currentPriority || goal.priority < newPriority) {
        return goal.priority;
      }

      return goal.priority + 1;
    };

    return pipe(
      map((goal: ClientBudgetGoal) => ({
        ...goal,
        priority: goal.id === goalId ? newPriority : getPriority(goal),
      })),
      sortBy(prop('priority')),
    )(goals);
  };
