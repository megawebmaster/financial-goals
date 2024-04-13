import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FormEvent } from 'react';
import { useOutletContext, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { BudgetGoalForm } from '~/components/budget-goal-form';
import { createBudgetGoal } from '~/services/budget-goals.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getCurrentAmount } from '~/helpers/budget-goals';
import type { BudgetsLayoutContext } from '~/helpers/budgets';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - New goal',
  },
];

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
    const freeSavings = data.get('freeSavings');

    invariant(name, 'Name of the goal is required');
    invariant(typeof name === 'string');
    invariant(requiredAmount, 'Goal required amount is required');
    invariant(typeof requiredAmount === 'string');
    invariant(currentAmount, 'Goal required amount is required');
    invariant(typeof currentAmount === 'string');
    invariant(freeSavings, 'Free savings amount is required');
    invariant(typeof freeSavings === 'string');

    await createBudgetGoal(userId, budgetId, freeSavings, {
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
  const { budget } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const requiredAmount = formData.get('requiredAmount') as string;
    const currentAmount = getCurrentAmount(
      budget.freeSavings,
      parseFloat(requiredAmount),
    );
    const freeSavings = budget.freeSavings - currentAmount;

    submit(
      {
        name: await encrypt(name, encryptionKey),
        requiredAmount: await encrypt(requiredAmount, encryptionKey),
        currentAmount: await encrypt(currentAmount.toString(10), encryptionKey),
        freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <a href={`/budgets/${budget.budgetId}`}>Go back</a>
      <h2>Add a goal to {budget.name} budget</h2>
      <BudgetGoalForm
        budget={budget}
        onSubmit={handleSubmit}
        submit="Create goal!"
      />
    </>
  );
}
