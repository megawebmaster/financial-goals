import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import type { BudgetUser, User } from '@prisma/client';

export type ClientBudget = BudgetUser & {
  currentSavings: number;
  freeSavings: number;
};

export type BudgetsLayoutContext = {
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
  user: User;
};
