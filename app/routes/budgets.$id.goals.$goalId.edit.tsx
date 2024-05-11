import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSubmit,
} from '@remix-run/react';
import type { FormEvent } from 'react';
import { pipe, propEq } from 'ramda';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import { toast } from 'sonner';
import invariant from 'tiny-invariant';

import { updateBudgetGoal } from '~/services/budget-goals.server';
import { getGoalsSum } from '~/helpers/budget-goals';
import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import { encrypt, unlockKey } from '~/services/encryption.client';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
  removeGoal,
  updateGoal,
} from '~/services/budget-goals.client';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('goal.edit.title'),
  };
}

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      invariant(params.goalId, 'Goal ID is required');
      invariant(typeof params.goalId === 'string');

      const goalId = parseInt(params.goalId, 10);
      invariant(!isNaN(goalId), 'Goal ID must be a number');

      const data = await request.formData();
      const freeSavings = data.get('freeSavings');
      const goals = data.get('goals');

      invariant(freeSavings, 'Free budget savings is required');
      invariant(typeof freeSavings === 'string');
      invariant(goals, 'Updated goals are required');
      invariant(typeof goals === 'string');

      await updateBudgetGoal(
        userId,
        budgetId,
        goalId,
        freeSavings,
        JSON.parse(goals),
      );

      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}`, {
        message: t('goal.edit.changes-saved'),
      });
    } catch (e) {
      console.error('Updating goal failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'errors',
      );

      return redirectWithError(
        `/budgets/${params.id}/goals/${params.goalId}/edit`,
        { message: t('goal.edit.updating-failed') },
      );
    }
  },
);

const getGoalsCurrentAmount = getGoalsSum('currentAmount');

export default function () {
  const { t } = useTranslation();
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const { goalId } = useParams();
  const submit = useSubmit();
  const navigate = useNavigate();
  const goal = goals.find(propEq(parseInt(goalId || ''), 'id'));

  if (!goal) {
    toast.warning(t('goal.edit.not-found'));
    navigate(`/budgets/${budget.budgetId}`);
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const requiredAmount = parseFloat(formData.get('requiredAmount') as string);
    const processGoals = pipe(
      updateGoal(goal.id, { name, requiredAmount }),
      buildGoalsFiller(budget.currentSavings),
    );

    const updatedGoals = processGoals(goals);
    const freeSavings =
      budget.currentSavings - getGoalsCurrentAmount(updatedGoals);

    submit(
      {
        freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
        goals: JSON.stringify(
          await Promise.all(
            updatedGoals.map((item) => encryptBudgetGoal(item, encryptionKey)),
          ),
        ),
      },
      { method: 'patch' },
    );
  };

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);

    const processGoals = pipe(
      removeGoal(goal.id),
      buildGoalsFiller(budget.currentSavings),
    );

    const updatedGoals = processGoals(goals);
    const freeSavings =
      budget.currentSavings - getGoalsCurrentAmount(updatedGoals);

    submit(
      {
        freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
        goals: JSON.stringify(
          await Promise.all(
            updatedGoals.map((item) => encryptBudgetGoal(item, encryptionKey)),
          ),
        ),
      },
      {
        action: `/budgets/${budget.budgetId}/goals/${goal.id}/destroy`,
        method: 'post',
        replace: true,
      },
    );
  };

  return (
    <>
      <a href={`/budgets/${budget.budgetId}`}>{t('goal.edit.back')}</a>
      <h2>{t('goal.edit.page.title', { budget: budget.name })}</h2>
      <BudgetGoalForm
        budget={budget}
        goal={goal}
        onSubmit={handleSubmit}
        submit={t('goal.edit.form.submit')}
      />
      <form onSubmit={handleDelete}>
        <button type="submit">{t('goal.edit.delete.submit')}</button>
      </form>
    </>
  );
}
