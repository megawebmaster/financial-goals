import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
} from '@remix-run/react';
import { redirectWithError } from 'remix-toast';
import invariant from 'tiny-invariant';

import { INDEX_ROUTE } from '~/routes';
import type {
  AuthenticatedLayoutContext,
  BudgetsLayoutContext,
} from '~/helpers/budgets';
import { authenticatedLoader } from '~/helpers/auth';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { getBudgetSavings } from '~/services/budget-savings-entries.server';
import { GoalsList } from '~/components/budgets/goals-list';
import { SavingsList } from '~/components/budgets/savings-list';
import { DecryptingMessage } from '~/components/decrypting-message';
import i18next from '~/i18n.server';
import { propEq } from 'ramda';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const loader = authenticatedLoader(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      return {
        goals: await getBudgetGoals(userId, budgetId),
        savings: await getBudgetSavings(budgetId),
      };
    } catch (e) {
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError(INDEX_ROUTE, { message: t('budget.not-found') });
    }
  },
);

export default function () {
  const { goals, savings } = useLoaderData<typeof loader>();
  const { id } = useParams();
  const { budgets, user } = useOutletContext<AuthenticatedLayoutContext>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const budget = budgets.find(propEq(parseInt(id || ''), 'budgetId'));

  if (!budget) {
    toast.warning(t('budget.not-found'));
    navigate('/');
    return null;
  }

  return (
    <GoalsList encryptionKey={budget.key} goals={goals}>
      <SavingsList encryptionKey={budget.key} savings={savings}>
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
      </SavingsList>
    </GoalsList>
  );
}
