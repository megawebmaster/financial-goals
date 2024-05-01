import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { Budget } from '~/components/budget';
import { GoalsList } from '~/components/budgets/goals-list';
import { LOGIN_ROUTE } from '~/routes';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

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
    // TODO: Handle errors notifications
    return redirect('/budgets');
  }
}

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

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
                  <Outlet context={{ budget, goals } as BudgetsLayoutContext} />
                )}
              </GoalsList.Fulfilled>
            </>
          )}
        </Budget.Fulfilled>
      </GoalsList>
    </Budget>
  );
}
