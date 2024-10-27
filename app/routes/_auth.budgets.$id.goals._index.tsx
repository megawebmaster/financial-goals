import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useOutletContext } from '@remix-run/react';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { filter, propEq } from 'ramda';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { getGoalsSum } from '~/helpers/budget-goals';
import { getAverageSavings } from '~/services/budget-savings-entries.client';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { GoalsTable } from '~/components/goals/goals-table';
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

const getShortTermGoals = filter(propEq('quick', 'type'));
const getLongTermGoals = filter(propEq('long', 'type'));
const getRequiredAmount = getGoalsSum('requiredAmount');
const getCurrentAmount = getGoalsSum('currentAmount');

export default function () {
  const { t } = useTranslation();
  const { budget, goals, savings } = useOutletContext<BudgetsLayoutContext>();

  const averageSavings = getAverageSavings(savings);
  const shortGoals = getShortTermGoals(goals);
  const longGoals = getLongTermGoals(goals);
  const shortGoalsAmount =
    getRequiredAmount(shortGoals) - getCurrentAmount(shortGoals);

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
              <span id="quick-goals" className="flex-1">
                {t('goals.table.quick.title')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsTable
              aria-labelledby="quick-goals"
              averageSavings={averageSavings}
              budget={budget}
              goals={shortGoals}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-2xl">
              <span id="long-goals" className="flex-1">
                {t('goals.table.long.title')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsTable
              aria-labelledby="long-goals"
              averageSavings={averageSavings}
              baseSavingsAmount={shortGoalsAmount}
              budget={budget}
              goals={longGoals}
            />
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
