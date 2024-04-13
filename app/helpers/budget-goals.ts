import type {
  BudgetGoal,
  BudgetSavingsEntry,
  BudgetUser,
} from '@prisma/client';

export type ClientBudget = BudgetUser & {
  currentSavings: number;
};

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
