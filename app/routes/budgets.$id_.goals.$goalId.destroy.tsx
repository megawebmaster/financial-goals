import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { deleteBudgetGoal } from '~/services/budget-goals.server';

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

  invariant(params.goalId, 'Goal ID is required');
  invariant(typeof params.goalId === 'string');

  const goalId = parseInt(params.goalId, 10);
  invariant(!isNaN(goalId), 'Goal ID must be a number');

  await deleteBudgetGoal(userId, budgetId, goalId);
  return redirect(`/budgets/${budgetId}`);
}
