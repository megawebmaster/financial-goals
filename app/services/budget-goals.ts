import { filter, map, pipe, prop, propEq, reduce, sortBy } from 'ramda';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getCurrentAmount } from '~/helpers/budget-goals';

export const buildGoalsCurrentAmountFiller =
  (type: string, amount: number) =>
  (goals: ClientBudgetGoal[]): ClientBudgetGoal[] => {
    // Create entries for each goal we can fill up with the amount added now
    let amountLeft = amount;

    return reduce(
      (entries, goal) => {
        if (goal.type === type) {
          const currentAmount = getCurrentAmount(
            amountLeft,
            goal.requiredAmount,
          );
          amountLeft -= currentAmount;

          return [...entries, { ...goal, currentAmount }];
        }

        return [...entries, goal];
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
      return goals;
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

const getGoalsCurrentAmount = (type: string, goals: ClientBudgetGoal[]) =>
  pipe(
    filter(propEq(type, 'type')),
    reduce((result, goal: ClientBudgetGoal) => result + goal.currentAmount, 0),
  )(goals);

const buildGoalsPriorityFiller =
  (type: string) => (goals: ClientBudgetGoal[]) => {
    let priority = 1;
    return goals.map((goal) => ({
      ...goal,
      priority: goal.type === type ? priority++ : goal.priority,
    }));
  };

const buildGoalsTypeProcessor =
  (action: (list: ClientBudgetGoal[]) => ClientBudgetGoal[]) =>
  (type: string, freeSavings: number, goals: ClientBudgetGoal[]) => {
    const amount = getGoalsCurrentAmount(type, goals);
    const processGoals = pipe(
      action,
      sortBy(prop('priority')),
      buildGoalsCurrentAmountFiller(type, amount + freeSavings),
      buildGoalsPriorityFiller(type),
    );
    const updatedGoals = processGoals(goals);
    const updatedAmount = getGoalsCurrentAmount(type, updatedGoals);

    return {
      // TODO: Optimization: skip unchanged goals
      goals: updatedGoals,
      freeSavings: freeSavings + amount - updatedAmount,
    };
  };

export const buildGoalsUpdater =
  (goals: ClientBudgetGoal[], freeSavings: number) =>
  (
    action: (list: ClientBudgetGoal[]) => ClientBudgetGoal[],
  ): { goals: ClientBudgetGoal[]; freeSavings: number } => {
    const goalsProcessor = buildGoalsTypeProcessor(action);

    const { goals: quickGoals, freeSavings: quickSavingsLeft } = goalsProcessor(
      'quick',
      freeSavings,
      goals,
    );

    const { goals: longGoals, freeSavings: longSavingsLeft } = goalsProcessor(
      'long',
      quickSavingsLeft,
      quickGoals,
    );

    return {
      goals: longGoals,
      freeSavings: longSavingsLeft,
    };
  };
