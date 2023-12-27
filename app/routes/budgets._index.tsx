import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';
import { getBudgets } from '~/services/budgets.server';
import { BudgetsList } from '~/components/budgets-list';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Your budgets',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  return {
    budgets: await getBudgets(userId),
  };
}

export default function () {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <p>Your budgets:</p>
      <BudgetsList budgets={data.budgets}>
        <BudgetsList.Pending>Decrypting data…</BudgetsList.Pending>
        <BudgetsList.Fulfilled>
          {(budgets) => (
            <>
              {budgets.length === 0 && <p>No budgets yet!</p>}
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
      <Link to="/budgets/new">Create budget</Link>
    </>
  );
}
