import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useOutletContext } from '@remix-run/react';
import { DollarSignIcon, EditIcon, ShareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { filter, propEq } from 'ramda';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { getMissingGoalsAmount } from '~/helpers/budget-goals';
import { getCurrentGoal } from '~/services/budget-goals.client';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Button } from '~/components/ui/button';
import { BudgetStatus } from '~/components/budgets/budget-status';
import { CurrentBudgetGoal } from '~/components/budgets/current-budget-goal';
import { GoalEstimatedCompletion } from '~/components/budgets/goal-estimated-completion';
import { GoalsSavingsChart } from '~/components/budgets/goals-savings-chart';
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

const getShortTermGoals = filter(propEq('quick', 'type'));

export default function () {
  const { t } = useTranslation();
  const { budget, goals, savings } = useOutletContext<BudgetsLayoutContext>();
  const currentQuickGoal = getCurrentGoal('quick', goals);
  const currentLongGoal = getCurrentGoal('long', goals);
  const shortGoals = getShortTermGoals(goals);
  const shortGoalsAmount = getMissingGoalsAmount(shortGoals);

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
        <BudgetStatus budget={budget} savings={savings} />
        {currentQuickGoal && (
          <CurrentBudgetGoal
            budget={budget}
            goal={currentQuickGoal}
            type="quick"
          >
            <GoalEstimatedCompletion
              currentGoal={currentQuickGoal}
              goals={goals}
              savings={savings}
            />
          </CurrentBudgetGoal>
        )}
        {currentLongGoal && (
          <CurrentBudgetGoal budget={budget} goal={currentLongGoal} type="long">
            <GoalEstimatedCompletion
              baseSavingsAmount={shortGoalsAmount}
              currentGoal={currentLongGoal}
              goals={goals}
              savings={savings}
            />
          </CurrentBudgetGoal>
        )}
        <GoalsSavingsChart budget={budget} goals={goals} savings={savings} />
      </PageContent>
    </>
  );
}
