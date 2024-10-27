import type { MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import { identity } from 'ramda';
import invariant from 'tiny-invariant';

import { INDEX_ROUTE } from '~/routes';
import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticatedAction, authenticatedLoader } from '~/helpers/auth';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import {
  buildGoalsUpdater,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import type { BudgetSavingsFormValues } from '~/components/budget-savings-entry-form';
import { BudgetSavingsEntryForm } from '~/components/budget-savings-entry-form';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export const loader = authenticatedLoader(async ({ params, request }) => {
  try {
    invariant(params.id, 'Budget ID is required');
    invariant(typeof params.id === 'string');

    const budgetId = parseInt(params.id, 10);
    invariant(!isNaN(budgetId), 'Budget ID must be a number');

    const t = await i18next.getFixedT(await i18next.getLocale(request));

    return {
      title: t('savings.new.title'),
    };
  } catch (e) {
    const t = await i18next.getFixedT(await i18next.getLocale(request), [
      'errors',
    ]);

    return redirectWithError(INDEX_ROUTE, {
      message: t('budget.not-found'),
    });
  }
});

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const data = await request.formData();
      const entryData = data.get('entryData');
      const budgetData = data.get('budgetData');
      const goals = data.get('goals');

      invariant(entryData, 'Data for entry is required');
      invariant(typeof entryData === 'string');
      invariant(budgetData, 'Budget data is required');
      invariant(typeof budgetData === 'string');
      invariant(goals, 'Goals are required');
      invariant(typeof goals === 'string');

      const budgetFields = JSON.parse(budgetData);
      const entryFields = JSON.parse(entryData);
      const updatedGoals = JSON.parse(goals);

      await createSavingsEntry(
        userId,
        budgetId,
        budgetFields,
        {
          ...entryFields,
          createdAt: new Date(entryFields.createdAt),
          updatedAt: new Date(entryFields.updatedAt || entryFields.createdAt),
        },
        updatedGoals,
      );
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}`, {
        message: t('savings.new.created'),
      });
    } catch (e) {
      console.error('Creating entry failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'errors',
      );

      return redirectWithError(`/budgets/${params.id}/savings/new`, {
        message: t('savings.new.creation-failed'),
      });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (values: BudgetSavingsFormValues) => {
    const encryptionKey = await unlockKey(budget.key);
    const currentSavings = budget.currentSavings + values.savingsAmount;
    const processGoals = buildGoalsUpdater(
      goals,
      budget.freeSavings + values.savingsAmount,
    );
    const { goals: updatedGoals, freeSavings } = processGoals(identity);

    submit(
      {
        entryData: JSON.stringify({
          createdAt: values.savingsDate,
          amount: await encrypt(
            values.savingsAmount.toString(10),
            encryptionKey,
          ),
        }),
        budgetData: JSON.stringify({
          currentSavings: await encrypt(
            currentSavings.toString(10),
            encryptionKey,
          ),
          freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
        }),
        goals: JSON.stringify(
          await Promise.all(
            updatedGoals.map((item) => encryptBudgetGoal(item, encryptionKey)),
          ),
        ),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <PageTitle
        back={`/budgets/${budget.budgetId}`}
        title={t('savings.new.page.title', { budget: budget.name })}
      />
      <PageContent>
        <BudgetSavingsEntryForm
          budget={budget}
          onSubmit={handleSubmit}
          status="create"
        />
      </PageContent>
    </>
  );
}
