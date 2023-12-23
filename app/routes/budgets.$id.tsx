import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { DecryptedBudget } from '~/components/decrypted-budget';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Your budget',
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  invariant(params.id, 'Budget ID is required');
  invariant(typeof params.id === 'string');

  const budgetId = parseInt(params.id, 10);
  invariant(!isNaN(budgetId), 'Budget ID must be a number');

  return {
    budget: await getBudget(userId, budgetId),
  };
}

export default function () {
  const data = useLoaderData<typeof loader>();

  return (
    <DecryptedBudget budget={data.budget}>
      <DecryptedBudget.Pending>Decrypting data…</DecryptedBudget.Pending>
      <DecryptedBudget.Fulfilled>
        {(budget) => (
          <>
            <h2>
              Your budget: {budget.name}
              <a href={`/budgets/${budget.budgetId}/edit`}>Edit</a>
            </h2>
          </>
        )}
      </DecryptedBudget.Fulfilled>
    </DecryptedBudget>
  );
}
