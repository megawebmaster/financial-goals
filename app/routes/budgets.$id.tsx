import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError } from 'remix-toast';
import type { User } from '@prisma/client';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { getBudget } from '~/services/budgets.server';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { Budget } from '~/components/budget';
import { GoalsList } from '~/components/budgets/goals-list';
import { authenticatedLoader } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const loader = authenticatedLoader(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      return {
        budget: await getBudget(userId, budgetId),
        goals: await getBudgetGoals(userId, budgetId),
      };
    } catch (e) {
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError('/budgets', { message: t('budget.not-found') });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const user = useOutletContext<User>();

  return (
    <Budget budget={data.budget}>
      <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
        <Budget.Pending>{t('budget.encryption.decrypting')}</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => (
            <>
              <GoalsList.Pending>
                {t('budget.encryption.decrypting')}
              </GoalsList.Pending>
              <GoalsList.Fulfilled>
                {(goals) => (
                  <Outlet
                    context={{ budget, goals, user } as BudgetsLayoutContext}
                  />
                )}
              </GoalsList.Fulfilled>
            </>
          )}
        </Budget.Fulfilled>
      </GoalsList>
    </Budget>
  );
}
