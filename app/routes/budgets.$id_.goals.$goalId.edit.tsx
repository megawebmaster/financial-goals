import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { Budget } from '~/components/budget';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import type { FormEvent } from 'react';
import { encrypt, unlockKey } from '~/services/encryption.client';
import {
  getBudgetGoal,
  updateBudgetGoal,
} from '~/services/budget-goals.server';
import { Goal } from '~/components/budgets/goal';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Edit goal',
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

  invariant(params.goalId, 'Goal ID is required');
  invariant(typeof params.goalId === 'string');

  const goalId = parseInt(params.goalId, 10);
  invariant(!isNaN(goalId), 'Goal ID must be a number');

  return {
    budget: await getBudget(userId, budgetId),
    goal: await getBudgetGoal(userId, budgetId, goalId),
  };
}

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

  const data = await request.formData();
  const name = data.get('name');
  const requiredAmount = data.get('requiredAmount');

  invariant(name, 'Name of the goal is required');
  invariant(typeof name === 'string');
  invariant(requiredAmount, 'Goal required amount is required');
  invariant(typeof requiredAmount === 'string');

  await updateBudgetGoal(userId, budgetId, goalId, { name, requiredAmount });
  return redirect(`/budgets/${budgetId}`);
}

export default function () {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(data.budget.key);
    const formData = new FormData(event.target as HTMLFormElement);

    const name = await encrypt(formData.get('name') as string, encryptionKey);
    const requiredAmount = await encrypt(
      formData.get('requiredAmount') as string,
      encryptionKey,
    );

    submit({ name, requiredAmount }, { method: 'patch' });
  };

  return (
    <>
      <Budget budget={data.budget}>
        <Budget.Pending>Decrypting data…</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => <h2>Update goal in {budget.name} budget</h2>}
        </Budget.Fulfilled>
      </Budget>
      <Goal encryptionKey={data.budget.key} goal={data.goal}>
        <Goal.Pending>Decrypting data…</Goal.Pending>
        <Goal.Fulfilled>
          {(goal) => (
            <BudgetGoalForm
              budget={data.budget}
              goal={goal}
              onSubmit={handleSubmit}
              submit="Update goal!"
            />
          )}
        </Goal.Fulfilled>
      </Goal>
      <Form
        action={`/budgets/${data.budget.budgetId}/goals/${data.goal.id}/destroy`}
        method="post"
      >
        <button type="submit">Delete goal</button>
      </Form>
    </>
  );
}
