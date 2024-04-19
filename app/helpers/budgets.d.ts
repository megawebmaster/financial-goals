import type { ClientBudget, ClientBudgetGoal } from '~/helpers/budget-goals';
import type { User } from '@prisma/client';

export type BudgetsLayoutContext = {
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
  user: User;
};
