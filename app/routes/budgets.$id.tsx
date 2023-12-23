import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { Budget } from '~/components/budget';
import { GoalsList } from '~/components/budgets/goals-list';

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

  try {
    invariant(params.id, 'Budget ID is required');
    invariant(typeof params.id === 'string');

    const budgetId = parseInt(params.id, 10);
    invariant(!isNaN(budgetId), 'Budget ID must be a number');

    return {
      budget: await getBudget(userId, budgetId),
      goals: await getBudgetGoals(userId, budgetId),
    };
  } catch (e) {
    // TODO: Handle errors notifications
    return redirect('/budgets');
  }
}

export default function () {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <a href="/budgets">Go back</a>
      <Budget budget={data.budget}>
        <Budget.Pending>Decrypting data…</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => (
            <>
              <h2>
                Your budget: {budget.name}
                <a href={`/budgets/${budget.budgetId}/edit`}>Edit</a>
              </h2>
            </>
          )}
        </Budget.Fulfilled>
      </Budget>
      <h3>Goals:</h3>
      <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
        <GoalsList.Pending>Decrypting goals…</GoalsList.Pending>
        <GoalsList.Fulfilled>
          {(goals) => (
            <>
              {goals.length === 0 && <p>No goals yet!</p>}
              <ul>
                {goals.map((goal) => (
                  <li key={goal.id}>
                    {goal.name} - {goal.requiredAmount}{' '}
                    <a
                      href={`/budgets/${data.budget.budgetId}/goals/${goal.id}/edit`}
                    >
                      Edit
                    </a>
                    <a
                      href={`/budgets/${data.budget.budgetId}/goals/${goal.id}/priority/up`}
                    >
                      Move up
                    </a>
                    <a
                      href={`/budgets/${data.budget.budgetId}/goals/${goal.id}/priority/down`}
                    >
                      Move down
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </GoalsList.Fulfilled>
      </GoalsList>
      <a href={`/budgets/${data.budget.budgetId}/goals/new`}>Create goal</a>
    </>
  );
}
