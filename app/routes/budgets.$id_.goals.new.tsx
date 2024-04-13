import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FormEvent } from 'react';
import { useLoaderData, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import { Budget } from '~/components/budget';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import { createBudgetGoal } from '~/services/budget-goals.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getCurrentAmount } from '~/helpers/budget-goals';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - New goal',
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
    const name = data.get('name');
    const requiredAmount = data.get('requiredAmount');
    const currentAmount = data.get('currentAmount');

    invariant(name, 'Name of the goal is required');
    invariant(typeof name === 'string');
    invariant(requiredAmount, 'Goal required amount is required');
    invariant(typeof requiredAmount === 'string');
    invariant(currentAmount, 'Goal required amount is required');
    invariant(typeof currentAmount === 'string');

    await createBudgetGoal(userId, budgetId, {
      name,
      requiredAmount,
      currentAmount,
      status: 'active',
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

  return (
    <>
      <a href={`/budgets/${data.budget.budgetId}`}>Go back</a>
      <Budget budget={data.budget}>
        <Budget.Pending>Decrypting data…</Budget.Pending>
        <Budget.Fulfilled>
          {(budget) => {
            const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const encryptionKey = await unlockKey(data.budget.key);
              const formData = new FormData(event.target as HTMLFormElement);
              const name = formData.get('name') as string;
              const requiredAmount = formData.get('requiredAmount') as string;
              const currentAmount = getCurrentAmount(
                // TODO: Subtract already used up savings
                budget.currentSavings,
                parseFloat(requiredAmount),
              ).toString(10);

              submit(
                {
                  name: await encrypt(name, encryptionKey),
                  requiredAmount: await encrypt(requiredAmount, encryptionKey),
                  currentAmount: await encrypt(currentAmount, encryptionKey),
                },
                { method: 'post' },
              );
            };

            return (
              <>
                <h2>Add a goal to {budget.name} budget</h2>
                <BudgetGoalForm
                  budget={data.budget}
                  onSubmit={handleSubmit}
                  submit="Create goal!"
                />
              </>
            );
          }}
        </Budget.Fulfilled>
      </Budget>
    </>
  );
}
