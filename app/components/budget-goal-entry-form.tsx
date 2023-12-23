import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import type {
  BudgetGoalWithEntries,
  ClientBudgetGoalEntry,
} from '~/helpers/budget-goals';

type BudgetGoalEntryFormProps = {
  budget: BudgetUser;
  goal?: BudgetGoalWithEntries;
  entry?: ClientBudgetGoalEntry;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
};

export const BudgetGoalEntryForm = ({
  budget,
  goal,
  entry,
  onSubmit,
  submit,
}: BudgetGoalEntryFormProps) => {
  if (!goal) {
    return (
      <>
        <p>You have no goals now.</p>
        <p>
          <a href={`/budgets/${budget.budgetId}/goals/new`}>Create new one!</a>
        </p>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="budgetId" value={budget.budgetId} />
      <input type="hidden" name="goalId" value={goal.id} />
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
