import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { getBudgets } from '~/services/budgets.server';
import { BudgetsList } from '~/components/budgets-list';
import { LOGIN_ROUTE } from '~/routes';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    budgets: await getBudgets(userId),
    title: t('budgets.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <a href="/budgets/invitations">Invitations</a>
      <p>{t('budgets.page.title')}:</p>
      <BudgetsList budgets={data.budgets}>
        <BudgetsList.Pending>
          {t('budgets.encryption.decrypting')}
        </BudgetsList.Pending>
        <BudgetsList.Fulfilled>
          {(budgets) => (
            <>
              {budgets.length === 0 && <p>{t('budgets.list.empty')}</p>}
              <ul>
                {budgets?.map((budget) => (
                  <li key={budget.budgetId}>
                    <a href={`/budgets/${budget.budgetId}`}>{budget.name}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </BudgetsList.Fulfilled>
      </BudgetsList>
      <Link to="/budgets/new">{t('budgets.list.create')}</Link>
    </>
  );
}
