import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { ChangePriorityButton } from '~/components/budget-goal/change-priority-button';

type BudgetGoalProps = {
  budgetId: number;
  children?: ReactNode;
  goal: ClientBudgetGoal;
  onPriorityChange: (event: FormEvent<HTMLFormElement>) => void;
};

export function BudgetGoal({
  budgetId,
  children,
  goal,
  onPriorityChange,
}: BudgetGoalProps) {
  const { t } = useTranslation();

  return (
    <li key={goal.id}>
      {goal.name} - {goal.requiredAmount} (
      {goal.currentAmount !== 0 &&
        goal.currentAmount !== goal.requiredAmount &&
        `${goal.currentAmount}, `}
      {Math.round((goal.currentAmount / goal.requiredAmount) * 100)}%){' '}
      <a href={`/budgets/${budgetId}/goals/${goal.id}/edit`}>
        {t('budget.view.goals.edit')}
      </a>{' '}
      {children}
      <ChangePriorityButton
        goalId={goal.id}
        priority={goal.priority - 1}
        onPriorityChange={onPriorityChange}
      >
        {t('budget.view.goals.move-up')}
      </ChangePriorityButton>{' '}
      <ChangePriorityButton
        goalId={goal.id}
        priority={goal.priority + 1}
        onPriorityChange={onPriorityChange}
      >
        {t('budget.view.goals.move-down')}
      </ChangePriorityButton>
    </li>
  );
}
