import type { BudgetGoal, BudgetSavingsEntry } from '@prisma/client';
import { reduce } from 'ramda';

import type { PickFieldsOfType } from '~/helpers/types';

export type ClientBudgetGoal = Omit<
  BudgetGoal,
  'requiredAmount' | 'currentAmount'
> & {
  currentAmount: number;
  requiredAmount: number;
};

export type ClientBudgetSavingsEntry = Omit<BudgetSavingsEntry, 'value'> & {
  date: string;
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
