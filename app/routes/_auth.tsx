import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { INDEX_ROUTE } from '~/routes';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageNavLink } from '~/components/ui/page-nav-link';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { PageBody } from '~/components/ui/page-body';
import { Skeleton } from '~/components/ui/skeleton';
import { BudgetsMenu } from '~/components/budgets-menu';
import { UserMenu } from '~/components/user-menu';
import { DataLoading } from '~/components/data-loading';
import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import { authenticatedLoader } from '~/helpers/auth';
import { useBudgets } from '~/hooks/useBudgets';
import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { getBudgets, getDefaultBudget } from '~/services/budgets.server';
import { buildWrappingKey } from '~/services/encryption.client';

export const loader = authenticatedLoader(
  async ({ request, params }, userId) => {
    try {
      return {
        user: await getUser(userId),
        budgets: await getBudgets(userId),
        defaultBudget: await getDefaultBudget(userId),
      };
    } catch (e) {
      return await authenticator.logout(request, {
        redirectTo: INDEX_ROUTE,
      });
    }
  },
);

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const data = await serverLoader<typeof loader>();
  await buildWrappingKey(data.user.salt);

  return data;
}

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const budgetId =
    parseInt(params.id || '0', 10) || data.defaultBudget?.budgetId;
  const { budgets, decryptingBudgets } = useBudgets(data.budgets);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav>
          <PageNavLink to={`/budgets/${budgetId}`}>
            {t('nav.dashboard')}
          </PageNavLink>
          <PageNavLink to={`/budgets/${budgetId}/goals`}>
            {t('nav.goals')}
          </PageNavLink>
        </PageMainNav>
        <PageUserNav>
          {!budgets || decryptingBudgets ? (
            <Skeleton className="h-6 w-48 mx-2" />
          ) : (
            <BudgetsMenu budgets={budgets} selectedBudgetId={budgetId} />
          )}
          <UserMenu user={data.user} />
        </PageUserNav>
      </PageHeader>
      <PageBody>
        {decryptingBudgets ? (
          <DataLoading />
        ) : (
          <Outlet
            context={
              {
                budgets,
                user: data.user,
              } as AuthenticatedLayoutContext
            }
          />
        )}
      </PageBody>
    </div>
  );
}
