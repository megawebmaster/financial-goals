import type { ReactNode } from 'react';
import { Link, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ListIcon } from 'lucide-react';

import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalPercentage } from '~/helpers/budget-goals';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 text-2xl">
          <span className="flex-1">
            {t(`component.current-goal.${type}.title`, { name: goal.name })}
          </span>
          <Button asChild variant="outline">
            <Link to={`/budgets/${budget.budgetId}/goals`}>
              <ListIcon className="mr-2 size-4" />
              <span>{t('component.current-goal.all-goals')}</span>
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
