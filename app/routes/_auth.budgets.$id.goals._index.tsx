import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useOutletContext } from '@remix-run/react';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import {
  buildAmountToSaveCalculator,
  getRequiredAmount,
} from '~/services/budget-goals.client';
import { getAverageSavings } from '~/services/budget-savings-entries.client';
import { BudgetGoal } from '~/components/budget-goal';
import { GoalEstimate } from '~/components/budget-goal/goal-estimate';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('goals.view.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const { budget, goals, savings } = useOutletContext<BudgetsLayoutContext>();

  const averageSavings = getAverageSavings(savings);
  const amountToSaveCalculator = buildAmountToSaveCalculator(goals);
  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: 'pl-PL' };

  return (
    <>
      <PageTitle title={t('goals.view.name')}>
        <Button
          asChild
          variant="outline"
          className="bg-green-300 hover:bg-green-200"
        >
          <Link to={`/budgets/${budget.budgetId}/goals/new`}>
            <PlusIcon className="mr-2 size-4" />
            <span>{t('goals.view.create')}</span>
          </Link>
        </Button>
      </PageTitle>
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-2xl">
              <span id="all-goals" className="flex-1">
                {t('goals.table.title')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table aria-labelledby="all-goals">
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
                    budgetId={budget.budgetId}
                    goal={goal}
                    goalsCount={goals.length}
                  >
                    <GoalEstimate
                      averageSavings={averageSavings}
                      amountToSave={amountToSaveCalculator(goal.id)}
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
                      value: budget.currentSavings,
                      formatParams: {
                        value: FORMAT_CURRENCY,
                      },
                    })}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
