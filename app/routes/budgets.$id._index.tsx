import type { FormEvent } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useOutletContext, useSubmit } from '@remix-run/react';
import { DollarSignIcon, EditIcon, PlusIcon, ShareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pipe } from 'ramda';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { unlockKey } from '~/services/encryption.client';
import {
  buildAmountToSaveCalculator,
  buildGoalsFiller,
  buildGoalsSorting,
  encryptBudgetGoal,
  getCurrentGoal,
  getRequiredAmount,
} from '~/services/budget-goals.client';
import { getAverageSavings } from '~/services/budget-savings-entries.client';
import { BudgetGoal } from '~/components/budget-goal';
import { GoalEstimate } from '~/components/budget-goal/goal-estimate';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { CurrentBudgetGoal } from '~/components/budgets/current-budget-goal';
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
    title: t('budget.view.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const { budget, goals, savings } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const changePriority = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);
    const amount = goals.reduce(
      (result, goal) => result + goal.currentAmount,
      0,
    );

    const goalId = parseInt(formData.get('goalId') as string);
    const priority = parseInt(formData.get('priority') as string);

    const processGoals = pipe(
      buildGoalsSorting(goalId, priority),
      buildGoalsFiller(amount),
    );

    const updatedGoals = await Promise.all(
      processGoals(goals).map((item) => encryptBudgetGoal(item, encryptionKey)),
    );

    submit(
      { goals: JSON.stringify(updatedGoals) },
      {
        action: `/budgets/${budget.budgetId}/goals/priority`,
        method: 'post',
      },
    );
  };

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
            <p className="flex gap-1">
              <strong>
                {t('budget.view.current-goal.estimated-completion')}:
              </strong>
              <GoalEstimate
                averageSavings={averageSavings}
                amountToSave={amountToSaveCalculator(currentGoal.id)}
              />
            </p>
          </CurrentBudgetGoal>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-2xl">
              <span className="flex-1">{t('budget.view.goals')}</span>
              <Button asChild variant="outline">
                <Link to={`/budgets/${budget.budgetId}/goals/new`}>
                  <PlusIcon className="mr-2 size-4" />
                  <span>{t('budget.view.goals.create')}</span>
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('budget.view.goals.table.name')}</TableHead>
                  <TableHead>
                    {t('budget.view.goals.table.required-amount')}
                  </TableHead>
                  <TableHead>
                    {t('budget.view.goals.table.current-amount')}
                  </TableHead>
                  <TableHead>
                    {t('budget.view.goals.table.completion')}
                  </TableHead>
                  <TableHead>
                    {t('budget.view.goals.table.estimated-completion')}
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      {t('budget.view.goals.empty')}
                    </TableCell>
                  </TableRow>
                )}
                {goals.map((goal) => (
                  <BudgetGoal
                    key={goal.id}
                    budgetId={budget.budgetId}
                    goal={goal}
                    onPriorityChange={changePriority}
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
                  <TableCell>Total</TableCell>
                  <TableCell>
                    {t('budget.view.goals.table.total-value', {
                      value: getRequiredAmount(goals),
                      formatParams: {
                        value: FORMAT_CURRENCY,
                      },
                    })}
                  </TableCell>
                  <TableCell>
                    {t('budget.view.goals.table.total-value', {
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
