import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import type { BudgetGoalWithEntries } from '~/helpers/budget-goals';

type BudgetGoalFormProps = {
  budget: BudgetUser;
  goal?: BudgetGoalWithEntries;
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
