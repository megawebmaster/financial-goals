import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
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
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent } from '~/components/ui/card';
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

const Decrypting = () => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <Card>
        <CardContent className="pt-6">
          {t('budget.encryption.decrypting')}
        </CardContent>
      </Card>
    </PageContent>
  );
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const user = useOutletContext<User>();

  return (
    <Budget budget={data.budget}>
      <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
        <SavingsList encryptionKey={data.budget.key} savings={data.savings}>
          <Budget.Pending>
            <Decrypting />
          </Budget.Pending>
          <Budget.Fulfilled>
            {(budget) => (
              <>
                <GoalsList.Pending>
                  <Decrypting />
                </GoalsList.Pending>
                <GoalsList.Fulfilled>
                  {(goals) => (
                    <>
                      <SavingsList.Pending>
                        <Decrypting />
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
