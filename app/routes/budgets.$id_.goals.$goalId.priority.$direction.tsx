import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { updateBudgetGoalPriority } from '~/services/budget-goals.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  try {
    invariant(params.id, 'Budget ID is required');
    invariant(typeof params.id === 'string');

    const budgetId = parseInt(params.id, 10);
    invariant(!isNaN(budgetId), 'Budget ID must be a number');

    invariant(params.goalId, 'Goal ID is required');
    invariant(typeof params.goalId === 'string');

    const goalId = parseInt(params.goalId, 10);
    invariant(!isNaN(goalId), 'Goal ID must be a number');

    invariant(params.direction, 'Direction is required');
    invariant(
      params.direction === 'up' || params.direction === 'down',
      'Valid directions are: up or down',
    );

    await updateBudgetGoalPriority(userId, budgetId, goalId, params.direction);
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    console.error('Changing goal priority failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/${params.id}`);
  }
}
