import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { EditIcon } from 'lucide-react';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalPercentage } from '~/helpers/budget-goals';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

type CurrentBudgetGoalProps = {
  budgetId: number;
  children?: ReactNode;
  goal: ClientBudgetGoal;
};

export function CurrentBudgetGoal({
  budgetId,
  children,
  goal,
}: CurrentBudgetGoalProps) {
  const { t } = useTranslation();

  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: 'pl-PL' };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 text-2xl">
          <span className="flex-1">
            {t('budget.view.current-goal', { name: goal.name })}
          </span>
          <Button asChild variant="outline">
            <Link to={`/budgets/${budgetId}/goals/${goal.id}/edit`}>
              <EditIcon className="mr-2 size-4" />
              <span>{t('budget.view.goals.edit')}</span>
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Improve the current goal part - it is very important */}
        <p className="flex gap-1">
          <strong>{t('budget.view.goals.required-amount')}:</strong>
          {t('budget.view.goals.required-amount-value', {
            value: goal.requiredAmount,
            formatParams: {
              value: FORMAT_CURRENCY,
            },
          })}
        </p>
        <p className="flex gap-1">
          <strong>{t('budget.view.goals.current-amount')}:</strong>
          {t('budget.view.goals.current-amount-value', {
            value: goal.currentAmount,
            percent: getGoalPercentage(goal),
            formatParams: {
              value: FORMAT_CURRENCY,
            },
          })}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}
