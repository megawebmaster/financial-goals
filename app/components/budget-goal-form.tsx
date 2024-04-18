import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="budgetId" value={budget.budgetId} />
      <label htmlFor="name">{t('component.goal-form.name')}</label>
      <input id="name" defaultValue={goal?.name} name="name" type="text" />
      <label htmlFor="amount">{t('component.goal-form.amount')}</label>
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
