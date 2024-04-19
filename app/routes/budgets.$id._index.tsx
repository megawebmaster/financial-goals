import type { FormEvent } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { pipe } from 'ramda';
import { useTranslation } from 'react-i18next';

import { unlockKey } from '~/services/encryption.client';
import {
  buildGoalsFiller,
  buildGoalsSorting,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import type { BudgetsLayoutContext } from '~/helpers/budgets';
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
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

  return (
    <>
      <a href="/budgets">{t('budget.view.back')}</a>
      <h2>
        <span>{t('budget.view.name', { name: budget.name })} </span>
        <a href={`/budgets/${budget.budgetId}/edit`}>{t('budget.view.edit')}</a>
        <a href={`/budgets/${budget.budgetId}/share`}>
          {t('budget.view.share')}
        </a>
      </h2>
      <p>
        <strong>{t('budget.view.current-savings')}:</strong>{' '}
        {budget.currentSavings}
      </p>
      {budget.freeSavings > 0 && (
        <p>
          <strong>{t('budget.view.free-savings')}:</strong> {budget.freeSavings}
        </p>
      )}
      <h3>{t('budget.view.goals')}:</h3>
      {goals.length === 0 && <p>{t('budget.view.goals.empty')}</p>}
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.name} - {goal.requiredAmount} (
            {goal.currentAmount !== 0 &&
              goal.currentAmount !== goal.requiredAmount &&
              `${goal.currentAmount}, `}
            {Math.round((goal.currentAmount / goal.requiredAmount) * 100)}%){' '}
            <a href={`/budgets/${budget.budgetId}/goals/${goal.id}/edit`}>
              {t('budget.view.goals.edit')}
            </a>{' '}
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="goalId" value={goal.id} />
              <input type="hidden" name="priority" value={goal.priority - 1} />
              <button type="submit">{t('budget.view.goals.move-up')}</button>
            </form>{' '}
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="goalId" value={goal.id} />
              <input type="hidden" name="priority" value={goal.priority + 1} />
              <button type="submit">{t('budget.view.goals.move-down')}</button>
            </form>
          </li>
        ))}
      </ul>
      <a href={`/budgets/${budget.budgetId}/goals/new`}>
        {t('budget.view.goals.create')}
      </a>
      <br />
      <a href={`/budgets/${budget.budgetId}/savings/new`}>
        {t('budget.view.savings.add')}
      </a>
    </>
  );
}
