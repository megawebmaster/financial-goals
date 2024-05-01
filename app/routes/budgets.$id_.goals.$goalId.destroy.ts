import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { deleteBudgetGoal } from '~/services/budget-goals.server';
import { LOGIN_ROUTE } from '~/routes';

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
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

    const data = await request.formData();
    const freeSavings = data.get('freeSavings');
    const goals = data.get('goals');

    invariant(freeSavings, 'Free budget savings is required');
    invariant(typeof freeSavings === 'string');
    invariant(goals, 'Updated goals are required');
    invariant(typeof goals === 'string');

    await deleteBudgetGoal(
      userId,
      budgetId,
      goalId,
      freeSavings,
      JSON.parse(goals),
    );
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    console.error('Deleting goal failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/${params.id}/goals/${params.goalId}/edit`);
  }
}
