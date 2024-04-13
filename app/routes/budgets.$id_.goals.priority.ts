import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { updateBudgetGoalsPriority } from '~/services/budget-goals.server';

export async function action({ params, request }: ActionFunctionArgs) {
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

    const data = await request.formData();
    const goals = data.get('goals');
    invariant(goals, 'Goals are required');
    invariant(typeof goals === 'string');

    await updateBudgetGoalsPriority(userId, budgetId, JSON.parse(goals));
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    console.error('Changing goal priority failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/${params.id}`);
  }
}
