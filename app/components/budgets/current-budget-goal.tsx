import type { ReactNode } from 'react';
import { useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalPercentage } from '~/helpers/budget-goals';

type CurrentBudgetGoalProps = {
  budget: ClientBudget;
  children?: ReactNode;
  goal: ClientBudgetGoal;
  type: string;
};

export function CurrentBudgetGoal({
  budget,
  children,
  goal,
  type,
}: CurrentBudgetGoalProps) {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };

  // TODO: Make it pretty!
  return (
    <>
      <h2 className="text-xl">
        {t(`component.current-goal.${type}.title`, { name: goal.name })}
      </h2>
      {/* TODO: Improve the current goal part - it is very important */}
      <p className="flex gap-1">
        <strong>{t('component.current-goal.required-amount')}:</strong>
        {t('component.current-goal.required-amount-value', {
          value: goal.requiredAmount,
          formatParams: {
            value: FORMAT_CURRENCY,
          },
        })}
      </p>
      <p className="flex gap-1">
        <strong>{t('component.current-goal.current-amount')}:</strong>
        {t('component.current-goal.current-amount-value', {
          value: goal.currentAmount,
          percent: getGoalPercentage(goal),
          formatParams: {
            value: FORMAT_CURRENCY,
          },
        })}
      </p>
      {children}
    </>
  );
}
