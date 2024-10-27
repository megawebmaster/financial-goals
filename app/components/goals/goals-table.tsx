import { useTranslation } from 'react-i18next';
import { useOutletContext } from '@remix-run/react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { BudgetGoal } from '~/components/budget-goal';
import { GoalEstimate } from '~/components/budget-goal/goal-estimate';
import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalsSum } from '~/helpers/budget-goals';
import { buildAmountToSaveCalculator } from '~/services/budget-goals.client';

type GoalsTableProps = {
  averageSavings: number;
  baseSavingsAmount?: number;
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
};

const getCurrentAmount = getGoalsSum('currentAmount');
const getRequiredAmount = getGoalsSum('requiredAmount');

export const GoalsTable = ({
  averageSavings,
  baseSavingsAmount = 0,
  budget,
  goals,
  ...props
}: GoalsTableProps) => {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };
  const calculateAmountToSave = buildAmountToSaveCalculator(
    baseSavingsAmount,
    goals,
  );

  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead>{t('goals.table.name')}</TableHead>
          <TableHead>{t('goals.table.required-amount')}</TableHead>
          <TableHead>{t('goals.table.current-amount')}</TableHead>
          <TableHead>{t('goals.table.completion')}</TableHead>
          <TableHead>{t('goals.table.estimated-completion')}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {goals.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              {t('goals.table.empty')}
            </TableCell>
          </TableRow>
        )}
        {goals.map((goal) => (
          <BudgetGoal
            key={goal.id}
            budget={budget}
            goal={goal}
            goalsCount={goals.length}
          >
            <GoalEstimate
              averageSavings={averageSavings}
              amountToSave={calculateAmountToSave(goal.id)}
            />
          </BudgetGoal>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>{t('goals.table.total')}</TableCell>
          <TableCell>
            {t('goals.table.total-value', {
              value: getRequiredAmount(goals),
              formatParams: {
                value: FORMAT_CURRENCY,
              },
            })}
          </TableCell>
          <TableCell>
            {t('goals.table.total-value', {
              value: getCurrentAmount(goals),
              formatParams: {
                value: FORMAT_CURRENCY,
              },
            })}
          </TableCell>
          <TableCell colSpan={3} />
        </TableRow>
      </TableFooter>
    </Table>
  );
};
