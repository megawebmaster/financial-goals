import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { updateBudgetGoalPriority } from '~/services/budget-goals.server';

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

    invariant(params.goalId, 'Goal ID is required');
    invariant(typeof params.goalId === 'string');

    const goalId = parseInt(params.goalId, 10);
    invariant(!isNaN(goalId), 'Goal ID must be a number');

    const data = await request.formData();
    const priorityValue = data.get('priority');
    const goalEntries = data.get('goalsEntries');
    invariant(priorityValue, 'Goal priority is required');
    invariant(typeof priorityValue === 'string');
    invariant(goalEntries, 'Entries for goals are required');
    invariant(typeof goalEntries === 'string');

    const priority = parseInt(priorityValue, 10);
    invariant(!isNaN(priority), 'Priority must be a number');

    await updateBudgetGoalPriority(
      userId,
      budgetId,
      goalId,
      priority,
      JSON.parse(goalEntries),
    );
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    console.error('Changing goal priority failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/${params.id}`);
  }
}
