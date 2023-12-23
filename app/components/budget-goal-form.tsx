import type { FormEvent } from 'react';
import type { BudgetGoal, BudgetUser } from '@prisma/client';

type BudgetGoalFormProps = {
  budget: BudgetUser;
  goal?: BudgetGoal;
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
      <input defaultValue={goal?.name} name="name" type="text" />
      <input
        defaultValue={goal?.requiredAmount}
        name="requiredAmount"
        type="number"
      />
      <button type="submit">{submit}</button>
    </form>
  );
};
