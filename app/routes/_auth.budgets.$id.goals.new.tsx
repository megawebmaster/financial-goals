import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticatedAction } from '~/helpers/auth';
import { getCurrentAmount } from '~/helpers/budget-goals';
import type { BudgetGoalFormValues } from '~/components/budget-goal-form';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import { createBudgetGoal } from '~/services/budget-goals.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('goal.new.title'),
  };
}

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const data = await request.formData();
      const name = data.get('name');
      const type = data.get('type');
      const requiredAmount = data.get('requiredAmount');
      const currentAmount = data.get('currentAmount');
      const freeSavings = data.get('freeSavings');

      invariant(name, 'Name of the goal is required');
      invariant(typeof name === 'string');
      invariant(type, 'Goal type is required');
      invariant(typeof type === 'string');
      invariant(
        ['quick', 'long'].includes(type),
        'Goals can be "quick" or "long" only.',
      );
      invariant(requiredAmount, 'Goal required amount is required');
      invariant(typeof requiredAmount === 'string');
      invariant(currentAmount, 'Goal required amount is required');
      invariant(typeof currentAmount === 'string');
      invariant(freeSavings, 'Free savings amount is required');
      invariant(typeof freeSavings === 'string');

      await createBudgetGoal(userId, budgetId, freeSavings, {
        name,
        type,
        requiredAmount,
        currentAmount,
        status: 'active',
      });
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}/goals`, {
        message: t('goal.new.created'),
      });
    } catch (e) {
      console.error('Creating goal failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'errors',
      );

      return redirectWithError(`/budgets/${params.id}/goals/new`, {
        message: t('goal.new.creation-failed'),
      });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const { budget } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (values: BudgetGoalFormValues) => {
    const encryptionKey = await unlockKey(budget.key);
    const currentAmount = getCurrentAmount(
      budget.freeSavings,
      values.goalAmount,
    );
    const freeSavings = budget.freeSavings - currentAmount;

    submit(
      {
        name: await encrypt(values.goalName, encryptionKey),
        type: values.goalType,
        requiredAmount: await encrypt(
          values.goalAmount.toString(10),
          encryptionKey,
        ),
        currentAmount: await encrypt(currentAmount.toString(10), encryptionKey),
        freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <PageTitle
        back={`/budgets/${budget.budgetId}/goals`}
        className="mb-8"
        title={t('goal.new.page.title', { budget: budget.name })}
      />
      <PageContent>
        <BudgetGoalForm
          budget={budget}
          onSubmit={handleSubmit}
          status="create"
        />
      </PageContent>
    </>
  );
}
