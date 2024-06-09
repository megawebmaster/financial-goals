import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import { Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { INDEX_ROUTE } from '~/routes';
import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { getBudgets } from '~/services/budgets.server';
import { buildWrappingKey } from '~/services/encryption.client';
import { authenticatedLoader } from '~/helpers/auth';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { UserMenu } from '~/components/ui/user-menu';
import { PageBody } from '~/components/ui/page-body';
import { BudgetsMenu } from '~/components/budgets/budgets-menu';
import { BudgetsList } from '~/components/budgets-list';
import { Skeleton } from '~/components/ui/skeleton';
import type { AuthenticatedLayoutContext } from '~/helpers/budgets';

export const loader = authenticatedLoader(async ({ request }, userId) => {
  try {
    return {
      user: await getUser(userId),
      budgets: await getBudgets(userId),
    };
  } catch (e) {
    return await authenticator.logout(request, {
      redirectTo: INDEX_ROUTE,
    });
  }
});

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const data = await serverLoader<typeof loader>();
  await buildWrappingKey(data.user.salt);

  return data;
}

export default function () {
  const { budgets, user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <BudgetsList budgets={budgets}>
      <div className="flex min-h-screen w-full flex-col">
        <PageHeader>
          <PageMainNav>
            <BudgetsList.Pending>
              <Skeleton className="h-6 mx-2" />
            </BudgetsList.Pending>
            <BudgetsList.Fulfilled>
              {(budgets) => (
                <BudgetsMenu budgets={budgets}>{t('nav.budgets')}</BudgetsMenu>
              )}
            </BudgetsList.Fulfilled>
          </PageMainNav>
          <PageUserNav>
            <UserMenu user={user} />
          </PageUserNav>
        </PageHeader>
        <PageBody>
          <BudgetsList.Pending>
            <Skeleton className="h-6 mx-2" />
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
