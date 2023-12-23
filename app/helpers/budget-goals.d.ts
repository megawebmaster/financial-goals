import type {
  BudgetGoal,
  BudgetGoalEntry,
  BudgetSavingsEntry,
} from '@prisma/client';

export type ClientBudgetSavingsEntry = Omit<BudgetSavingsEntry, 'value'> & {
  date: string;
  amount: number;
};

export type ClientBudgetGoalEntry = Omit<BudgetGoalEntry, 'value'> & {
  value: number;
};

export type BudgetGoalWithEntries = Omit<BudgetGoal, 'requiredAmount'> & {
  currentAmount: number;
  requiredAmount: number;
  entries?: ClientBudgetGoalEntry[];
};
