import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { INDEX_ROUTE } from '~/routes';
import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import { authenticatedLoader } from '~/helpers/auth';
import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { getBudgets, getDefaultBudget } from '~/services/budgets.server';
import { buildWrappingKey } from '~/services/encryption.client';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageNavLink } from '~/components/ui/page-nav-link';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { PageBody } from '~/components/ui/page-body';
import { PageContent } from '~/components/ui/page-content';
import { Skeleton } from '~/components/ui/skeleton';
import { BudgetsMenu } from '~/components/budgets-menu';
import { BudgetsList } from '~/components/budgets-list';
import { UserMenu } from '~/components/user-menu';

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
  const { budgets, defaultBudget, user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const params = useParams();
  const budgetId = parseInt(params.id || '0', 10) || defaultBudget?.budgetId;

  return (
    <BudgetsList budgets={budgets}>
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
            <BudgetsList.Pending>
              <Skeleton className="h-6 w-48 mx-2" />
            </BudgetsList.Pending>
            <BudgetsList.Fulfilled>
              {(budgets) => (
                <BudgetsMenu budgets={budgets} selectedBudgetId={budgetId} />
              )}
            </BudgetsList.Fulfilled>
            <UserMenu user={user} />
          </PageUserNav>
        </PageHeader>
        <PageBody>
          <BudgetsList.Pending>
            <PageContent>
              <Skeleton className="h-10 mx-2" />
              <Skeleton className="h-24 mx-2" />
              <Skeleton className="h-32 mx-2" />
            </PageContent>
          </BudgetsList.Pending>
          <BudgetsList.Fulfilled>
            {(budgets) => (
              <Outlet
                context={{ budgets, user } as AuthenticatedLayoutContext}
              />
            )}
          </BudgetsList.Fulfilled>
        </PageBody>
      </div>
    </BudgetsList>
  );
}
