import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useOutletContext } from '@remix-run/react';
import { DollarSignIcon, EditIcon, ShareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import {
  buildAmountToSaveCalculator,
  getCurrentGoal,
} from '~/services/budget-goals.client';
import { getAverageSavings } from '~/services/budget-savings-entries.client';
import { GoalEstimate } from '~/components/budget-goal/goal-estimate';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { CurrentBudgetGoal } from '~/components/budgets/current-budget-goal';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('budget.view.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const { budget, goals, savings } = useOutletContext<BudgetsLayoutContext>();

  const averageSavings = getAverageSavings(savings);
  const amountToSaveCalculator = buildAmountToSaveCalculator(goals);
  const currentGoal = getCurrentGoal(goals);
  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: 'pl-PL' };

  return (
    <>
      <PageTitle
        title={t(`budget.view.${budget.isOwner ? 'owner' : 'shared'}.name`, {
          name: budget.name,
        })}
      >
        <Button asChild variant="outline">
          <Link to={`/budgets/${budget.budgetId}/edit`}>
            <EditIcon className="mr-2 size-4" />
            <span>{t('budget.view.edit')}</span>
          </Link>
        </Button>
        {budget.isOwner && (
          <Button asChild variant="outline">
            <Link to={`/budgets/${budget.budgetId}/share`}>
              <ShareIcon className="mr-2 size-4" />
              <span>{t('budget.view.share')}</span>
            </Link>
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          className="bg-green-300 hover:bg-green-200"
        >
          <Link to={`/budgets/${budget.budgetId}/savings/new`}>
            <DollarSignIcon className="mr-2 size-4" />
            <span>{t('budget.view.savings.add')}</span>
          </Link>
        </Button>
      </PageTitle>
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('budget.view.status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>{t('budget.view.current-savings')}:</strong>{' '}
              {t('budget.view.savings-value', {
                average: averageSavings,
                value: budget.currentSavings,
                formatParams: {
                  average: FORMAT_CURRENCY,
                  value: FORMAT_CURRENCY,
                },
              })}
            </p>
            {budget.freeSavings > 0 && (
              <p>
                <strong>{t('budget.view.free-savings')}:</strong>{' '}
                {t('budget.view.free-savings-value', {
                  value: budget.freeSavings,
                  formatParams: {
                    value: FORMAT_CURRENCY,
                  },
                })}
              </p>
            )}
          </CardContent>
        </Card>
        {currentGoal && (
          <CurrentBudgetGoal budgetId={budget.budgetId} goal={currentGoal}>
            {averageSavings > 0 && (
              <p className="flex gap-1">
                <strong>
                  {t('budget.view.current-goal.estimated-completion')}:
                </strong>
                <GoalEstimate
                  averageSavings={averageSavings}
                  amountToSave={amountToSaveCalculator(currentGoal.id)}
                />
              </p>
            )}
          </CurrentBudgetGoal>
        )}
      </PageContent>
    </>
  );
}
