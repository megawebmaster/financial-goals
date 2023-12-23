import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { deleteBudget } from '~/services/budgets.server';

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  invariant(params.id, 'Budget ID is required');
  invariant(typeof params.id === 'string');

  const budgetId = parseInt(params.id, 10);
  invariant(!isNaN(budgetId), 'Budget ID must be a number');

  await deleteBudget(userId, budgetId);
  return redirect('/budgets');
}
