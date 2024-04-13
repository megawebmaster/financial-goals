import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';

type BudgetSavingsEntryFormProps = {
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
}: BudgetSavingsEntryFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="budgetId" value={budget.budgetId} />
      <label htmlFor="savings-date">Date</label>
      <input
        defaultValue={
          entry?.date.substring(0, 10) ||
          new Date().toISOString().substring(0, 10)
        }
        id="savings-date"
        name="date"
        type="date"
      />
      <label htmlFor="savings-amount">Amount</label>
      <input
        defaultValue={entry?.amount}
        id="savings-amount"
        name="amount"
        type="text"
      />
      <button type="submit">{submit}</button>
    </form>
  );
};
