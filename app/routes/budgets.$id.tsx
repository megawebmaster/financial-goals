import type { FormEvent } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { pipe } from 'ramda';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { Budget } from '~/components/budget';
import { GoalsList } from '~/components/budgets/goals-list';
import { unlockKey } from '~/services/encryption.client';
import {
  buildGoalsFiller,
  buildGoalsSorting,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';

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
  const submit = useSubmit();

  return (
    <>
      <a href="/budgets">Go back</a>
      <Budget budget={data.budget}>
        <Budget.Pending>Decrypting data…</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => (
            <>
              <h2>
                Your budget: {budget.name}{' '}
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
          {(goals) => {
            const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const encryptionKey = await unlockKey(data.budget.key);
              const formData = new FormData(event.target as HTMLFormElement);
              const amount = goals.reduce(
                (result, goal) => result + goal.currentAmount,
                0,
              );

              const goalId = parseInt(formData.get('goalId') as string);
              const priority = parseInt(formData.get('priority') as string);

              const processGoals = pipe(
                buildGoalsSorting(goalId, priority),
                buildGoalsFiller(amount),
              );

              const updatedGoals = await Promise.all(
                processGoals(goals).map((item) =>
                  encryptBudgetGoal(item, encryptionKey),
                ),
              );

              submit(
                { goals: JSON.stringify(updatedGoals) },
                {
                  action: `/budgets/${data.budget.budgetId}/goals/priority`,
                  method: 'post',
                },
              );
            };

            return (
              <>
                {goals.length === 0 && <p>No goals yet!</p>}
                <ul>
                  {goals.map((goal) => (
                    <li key={goal.id}>
                      {goal.name} - {goal.requiredAmount} (
                      {Math.round(
                        (goal.currentAmount / goal.requiredAmount) * 100,
                      )}
                      %){' '}
                      <a
                        href={`/budgets/${data.budget.budgetId}/goals/${goal.id}/edit`}
                      >
                        Edit
                      </a>{' '}
                      <form onSubmit={handleSubmit}>
                        <input type="hidden" name="goalId" value={goal.id} />
                        <input
                          type="hidden"
                          name="priority"
                          value={goal.priority - 1}
                        />
                        <button type="submit">Move up</button>
                      </form>{' '}
                      <form onSubmit={handleSubmit}>
                        <input type="hidden" name="goalId" value={goal.id} />
                        <input
                          type="hidden"
                          name="priority"
                          value={goal.priority + 1}
                        />
                        <button type="submit">Move down</button>
                      </form>
                    </li>
                  ))}
                </ul>
              </>
            );
          }}
        </GoalsList.Fulfilled>
      </GoalsList>
      <a href={`/budgets/${data.budget.budgetId}/goals/new`}>Create goal</a>
      <br />
      <a href={`/budgets/${data.budget.budgetId}/savings/new`}>Add savings</a>
    </>
  );
}
