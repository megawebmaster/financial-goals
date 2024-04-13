import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';

type BudgetGoalFormProps = {
  budget: BudgetUser;
  goal?: ClientBudgetGoal;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
};

export const BudgetGoalForm = ({
  budget,
  goal,
  onSubmit,
  submit,
}: BudgetGoalFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="budgetId" value={budget.budgetId} />
      <label htmlFor="name">Goal name</label>
      <input id="name" defaultValue={goal?.name} name="name" type="text" />
      <label htmlFor="amount">Required amount</label>
      <input
        id="amount"
        defaultValue={goal?.requiredAmount}
        name="requiredAmount"
        type="number"
      />
      <button type="submit">{submit}</button>
    </form>
  );
};
