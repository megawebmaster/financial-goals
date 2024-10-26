import type { ReactNode } from 'react';
import { Link, useOutletContext } from '@remix-run/react';
import { ArrowDownIcon, ArrowUpIcon, EditIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalPercentage } from '~/helpers/budget-goals';
import { ChangePriorityButton } from '~/components/budget-goal/change-priority-button';
import { Button } from '~/components/ui/button';
import { TableCell, TableRow } from '~/components/ui/table';

type BudgetGoalProps = {
  budgetId: number;
  children?: ReactNode;
  goal: ClientBudgetGoal;
  goalsCount: number;
};

export function BudgetGoal({
  budgetId,
  children,
  goal,
  goalsCount,
}: BudgetGoalProps) {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();

  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: user.preferredLocale };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{goal.name}</TableCell>
        <TableCell>
          {t('component.budget-goal.amount', {
            value: goal.requiredAmount,
            formatParams: {
              value: FORMAT_CURRENCY,
            },
          })}
        </TableCell>
        <TableCell>
          {t('component.budget-goal.amount', {
            value: goal.currentAmount,
            formatParams: {
              value: FORMAT_CURRENCY,
            },
          })}
        </TableCell>
        <TableCell>
          {t('component.budget-goal.percentage', {
            percent: getGoalPercentage(goal),
          })}
        </TableCell>
        <TableCell>{children}</TableCell>
        <TableCell>
          <div className="flex justify-end gap-1">
            <Button asChild variant="outline">
              <Link to={`/budgets/${budgetId}/goals/${goal.id}/edit`}>
                <EditIcon className="mr-2 size-4" />
                <span>{t('component.budget-goal.edit')}</span>
              </Link>
            </Button>
            <ChangePriorityButton
              disabled={goal.priority === 1}
              goalId={goal.id}
              priority={goal.priority - 1}
              title={t('component.budget-goal.move-up')}
            >
              <ArrowUpIcon />
            </ChangePriorityButton>{' '}
            <ChangePriorityButton
              disabled={goal.priority === goalsCount}
              goalId={goal.id}
              priority={goal.priority + 1}
              title={t('component.budget-goal.move-down')}
            >
              <ArrowDownIcon />
            </ChangePriorityButton>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
