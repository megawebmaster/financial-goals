import type { FormEvent } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { getBudget } from '~/services/budgets.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { BudgetSavingsEntryForm } from '~/components/budget-savings-entry-form';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import { encryptBudgetSavingsEntry } from '~/services/budget-savings-entries.client';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import { getGoalsSum } from '~/helpers/budget-goals';
import { authenticatedAction, authenticatedLoader } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export const loader = authenticatedLoader(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return {
        budget: await getBudget(userId, budgetId),
        goals: await getBudgetGoals(userId, budgetId),
        title: t('savings.new.title'),
      };
    } catch (e) {
      const t = await i18next.getFixedT(await i18next.getLocale(request), [
        'errors',
      ]);

      return redirectWithError('/budgets', {
        message: t('budget.not-found'),
      });
    }
  },
);

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const data = await request.formData();
      const entryValue = data.get('entryValue');
      const budgetData = data.get('budgetData');
      const goals = data.get('goals');

      invariant(entryValue, 'Value for entry is required');
      invariant(typeof entryValue === 'string');
      invariant(budgetData, 'Budget data is required');
      invariant(typeof budgetData === 'string');
      invariant(goals, 'Goals are required');
      invariant(typeof goals === 'string');

      await createSavingsEntry(
        userId,
        budgetId,
        JSON.parse(budgetData),
        entryValue,
        JSON.parse(goals),
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

const getGoalsCurrentAmount = getGoalsSum('currentAmount');

export default function () {
  const { t } = useTranslation();
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);

    const date = new Date(formData.get('date') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const currentSavings = budget.currentSavings + amount;
    const processGoals = buildGoalsFiller(currentSavings);
    const updatedGoals = processGoals(goals);
    const freeSavings = currentSavings - getGoalsCurrentAmount(updatedGoals);
    const entryValue = await encryptBudgetSavingsEntry(
      // TODO: Why did I decide to encrypt date here?
      date,
      amount,
      encryptionKey,
    );

    submit(
      {
        entryValue,
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
      <a href={`/budgets/${budget.budgetId}`}>{t('savings.new.back')}</a>
      <h2>{t('savings.new.page.title', { budget: budget.name })}</h2>
      <BudgetSavingsEntryForm
        budget={budget}
        onSubmit={handleSubmit}
        submit={t('savings.new.form.submit')}
      />
    </>
  );
}
