import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { Budget } from '~/components/budget';
import type { FormEvent } from 'react';
import { unlockKey } from '~/services/encryption.client';
import { createBudgetGoalEntry } from '~/services/budget-goal-entries.server';
import { encryptBudgetGoalEntry } from '~/services/budget-goal-entries.client';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { GoalsList } from '~/components/budgets/goals-list';
import { BudgetGoalEntryForm } from '~/components/budget-goal-entry-form';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - New entry',
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
    const goalId = data.get('goalId');
    const value = data.get('value');

    invariant(goalId, 'Goal ID is required');
    invariant(typeof goalId === 'string');
    invariant(value, 'Value for entry is required');
    invariant(typeof value === 'string');

    await createBudgetGoalEntry(userId, budgetId, parseInt(goalId, 10), {
      value,
    });
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    // TODO: Handle errors notifications
    console.error('Creating goal failed', e);
    return redirect(`/budgets/${params.id}/goals/new`);
  }
}

export default function () {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(data.budget.key);
    const formData = new FormData(event.target as HTMLFormElement);

    const date = new Date(formData.get('date') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const value = await encryptBudgetGoalEntry(date, amount, encryptionKey);

    submit(
      { goalId: formData.get('goalId') as string, value },
      { method: 'post' },
    );
  };

  return (
    <>
      <a href={`/budgets/${data.budget.budgetId}`}>Go back</a>
      <Budget budget={data.budget}>
        <Budget.Pending>Decrypting data…</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => <h2>Add an entry to {budget.name} budget</h2>}
        </Budget.Fulfilled>
      </Budget>
      <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
        <GoalsList.Pending>Decrypting data…</GoalsList.Pending>
        <GoalsList.Fulfilled>
          {(goals) => {
            const currentGoal = goals.find(
              (item) => item.requiredAmount !== item.currentAmount,
            );

            return (
              <BudgetGoalEntryForm
                budget={data.budget}
                goal={currentGoal}
                onSubmit={handleSubmit}
                submit="Create entry!"
              />
            );
          }}
        </GoalsList.Fulfilled>
      </GoalsList>
    </>
  );
}
