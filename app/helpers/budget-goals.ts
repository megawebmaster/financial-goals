import type { BudgetGoal, BudgetSavingsEntry } from '@prisma/client';
import { addMonths } from 'date-fns';
import { reduce } from 'ramda';

import type { PickFieldsOfType } from '~/helpers/types';

export type ClientBudgetGoal = Omit<
  BudgetGoal,
  'requiredAmount' | 'currentAmount'
> & {
  currentAmount: number;
  requiredAmount: number;
};

export type ClientBudgetSavingsEntry = Omit<BudgetSavingsEntry, 'amount'> & {
  createdAt: Date;
  amount: number;
};

export const getCurrentAmount = (
  currentSavings: number,
  requiredAmount: number,
) =>
  currentSavings == 0 || requiredAmount > currentSavings
    ? currentSavings
    : requiredAmount;

export const getGoalsSum = (
  field: PickFieldsOfType<ClientBudgetGoal, number>,
) =>
  reduce((result: number, goal: ClientBudgetGoal) => result + goal[field], 0);

export const getGoalsCurrentAmount = getGoalsSum('currentAmount');

export const getGoalPercentage = (goal: ClientBudgetGoal) =>
  Math.round((goal.currentAmount / goal.requiredAmount) * 100);

export const getGoalEstimatedCompletion = (
  amountToSave: number,
  averageSavings: number,
): null | Date => {
  if (amountToSave === 0) {
    return null;
  }
  if (averageSavings === 0) {
    return null;
  }

  const months = Math.ceil(amountToSave / averageSavings);

  return addMonths(new Date(), months);
};
