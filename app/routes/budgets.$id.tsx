import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { redirectWithError } from 'remix-toast';
import type { User } from '@prisma/client';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticatedLoader } from '~/helpers/auth';
import { getBudget } from '~/services/budgets.server';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { getBudgetSavings } from '~/services/budget-savings-entries.server';
import { Budget } from '~/components/budget';
import { GoalsList } from '~/components/budgets/goals-list';
import { SavingsList } from '~/components/budgets/savings-list';
import { DecryptingMessage } from '~/components/decrypting-message';
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
        savings: await getBudgetSavings(budgetId),
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
  const data = useLoaderData<typeof loader>();
  const user = useOutletContext<User>();

  return (
    <Budget budget={data.budget}>
      <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
        <SavingsList encryptionKey={data.budget.key} savings={data.savings}>
          <Budget.Pending>
            <DecryptingMessage />
          </Budget.Pending>
          <Budget.Fulfilled>
            {(budget) => (
              <>
                <GoalsList.Pending>
                  <DecryptingMessage />
                </GoalsList.Pending>
                <GoalsList.Fulfilled>
                  {(goals) => (
                    <>
                      <SavingsList.Pending>
                        <DecryptingMessage />
                      </SavingsList.Pending>
                      <SavingsList.Fulfilled>
                        {(savings) => (
                          <Outlet
                            context={
                              {
                                budget,
                                goals,
                                savings,
                                user,
                              } as BudgetsLayoutContext
                            }
                          />
                        )}
                      </SavingsList.Fulfilled>
                    </>
                  )}
                </GoalsList.Fulfilled>
              </>
            )}
          </Budget.Fulfilled>
        </SavingsList>
      </GoalsList>
    </Budget>
  );
}
