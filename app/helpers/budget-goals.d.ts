import type { BudgetGoal, BudgetGoalEntry } from '@prisma/client';

export type ClientBudgetGoalEntry = Omit<BudgetGoalEntry, 'value'> & {
  date: string;
  amount: number;
};

export type BudgetGoalWithEntries = Omit<BudgetGoal, 'requiredAmount'> & {
  currentAmount: number;
  requiredAmount: number;
  entries?: ClientBudgetGoalEntry[];
};
