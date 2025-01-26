import {
  Outlet,
  useLoaderData,
  useOutletContext,
  useParams,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import { redirectWithError } from 'remix-toast';
import { Loader2 } from 'lucide-react';
import { propEq } from 'ramda';

import { INDEX_ROUTE } from '~/routes';
import { DataLoading } from '~/components/data-loading';
import type {
  AuthenticatedLayoutContext,
  BudgetsLayoutContext,
} from '~/helpers/budgets';
import { authenticatedLoader } from '~/helpers/auth';
import { useGoals } from '~/hooks/useGoals';
import { useSavings } from '~/hooks/useSavings';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { getBudgetSavings } from '~/services/budget-savings-entries.server';
import i18next from '~/i18n.server';

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

const useBudget = () => {
  const { id } = useParams();
  const { budgets } = useOutletContext<AuthenticatedLayoutContext>();

  return budgets.find(propEq(parseInt(id || ''), 'budgetId'));
};

export default function () {
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const data = useLoaderData<typeof loader>();
  const budget = useBudget();
  const { goals, decryptingGoals, loadingGoals } = useGoals(budget, data.goals);
  const { savings, decryptingSavings, loadingSavings } = useSavings(
    budget,
    data.savings,
  );

  if (!budget) {
    return null;
  }

  if (loadingGoals || loadingSavings) {
    return <DataLoading />;
  }

  return (
    <>
      {(decryptingGoals || decryptingSavings) && (
        <div className="absolute top-0 w-full mx-8 h-10 flex justify-end items-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}
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
    </>
  );
}
