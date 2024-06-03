import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSubmit,
} from '@remix-run/react';
import { pipe, propEq } from 'ramda';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import { toast } from 'sonner';
import invariant from 'tiny-invariant';

import { authenticatedAction } from '~/helpers/auth';
import { getGoalsSum } from '~/helpers/budget-goals';
import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { updateBudgetGoal } from '~/services/budget-goals.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
  removeGoal,
  updateGoal,
} from '~/services/budget-goals.client';
import type { BudgetGoalFormValues } from '~/components/budget-goal-form';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Separator } from '~/components/ui/separator';
import { ConfirmationForm } from '~/components/ui/confirmation-form';
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

  const handleSubmit = async (values: BudgetGoalFormValues) => {
    const encryptionKey = await unlockKey(budget.key);
    const processGoals = pipe(
      updateGoal(goal.id, { name: values.name, requiredAmount: values.amount }),
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

  const handleDelete = async () => {
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
      <PageTitle
        back={`/budgets/${budget.budgetId}`}
        title={t('goal.edit.page.title', { budget: budget.name })}
      />
      <PageContent>
        <BudgetGoalForm
          className="flex flex-col gap-4"
          goal={goal}
          onSubmit={handleSubmit}
          status="update"
        >
          <Separator />
          <ConfirmationForm
            onSubmit={handleDelete}
            confirmation={t('goal.edit.delete-confirm')}
            description={t('goal.edit.delete-description')}
            className="w-full"
            replace
          >
            {t('goal.edit.delete')}
          </ConfirmationForm>
        </BudgetGoalForm>
      </PageContent>
    </>
  );
}
