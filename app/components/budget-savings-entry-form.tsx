import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';

type BudgetGoalEntryFormProps = {
  budget: BudgetUser;
  entry?: ClientBudgetSavingsEntry;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
};

export const BudgetSavingsEntryForm = ({
  budget,
  entry,
  onSubmit,
  submit,
}: BudgetGoalEntryFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="budgetId" value={budget.budgetId} />
      <input
        defaultValue={
          entry?.date.substring(0, 10) ||
          new Date().toISOString().substring(0, 10)
        }
        name="date"
        type="date"
      />
      <input defaultValue={entry?.amount} name="amount" type="text" />
      <button type="submit">{submit}</button>
    </form>
  );
};
