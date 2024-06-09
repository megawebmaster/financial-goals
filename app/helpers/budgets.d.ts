import type {
  ClientBudgetGoal,
  ClientBudgetSavingsEntry,
} from '~/helpers/budget-goals';
import type { BudgetUser, User } from '@prisma/client';

export type ClientBudget = BudgetUser & {
  currentSavings: number;
  freeSavings: number;
};

export type AuthenticatedLayoutContext = {
  budgets: ClientBudget[];
  user: User;
};

export type BudgetsLayoutContext = {
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
  savings: ClientBudgetSavingsEntry[];
  user: User;
};
