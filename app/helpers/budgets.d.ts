import type { ClientBudget, ClientBudgetGoal } from '~/helpers/budget-goals';

export type BudgetsLayoutContext = {
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
};
