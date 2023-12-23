import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';
import { getBudgets } from '~/services/budgets.server';
import { DecryptedBudgetsList } from '~/components/decrypted-budgets-list';

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
      <DecryptedBudgetsList budgets={data.budgets}>
        <DecryptedBudgetsList.Pending>
          Decrypting data…
        </DecryptedBudgetsList.Pending>
        <DecryptedBudgetsList.Fulfilled>
          {(data) => (
            <ul>
              {data?.map((budget) => (
                <li key={budget.budgetId}>
                  {budget.name}
                  <a href={`/budgets/${budget.budgetId}`}>View</a>
                  <a href={`/budgets/${budget.budgetId}/edit`}>Edit</a>
                </li>
              ))}
            </ul>
          )}
        </DecryptedBudgetsList.Fulfilled>
      </DecryptedBudgetsList>
      <Link to="/budgets/new">Create</Link>
    </>
  );
}
