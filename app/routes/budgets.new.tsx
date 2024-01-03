import type { FormEvent } from 'react';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import {
  encrypt,
  generateEncryptionKey,
  lockKey,
} from '~/services/encryption.client';
import { createBudget } from '~/services/budgets.server';
import { BudgetForm } from '~/components/budget-form';
import { useCastle } from '~/contexts/CastleContextProvider';
import { castleRisk } from '~/services/castle.server';
import { getUser } from '~/services/user.server';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Create budget',
  },
];

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request.clone());

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  try {
    const data = await request.clone().formData();
    const name = data.get('name');
    const key = data.get('key');

    invariant(name, 'Name of the budget is required');
    invariant(typeof name === 'string', 'Name must be a text');
    invariant(key, 'Budget encryption key is required');
    invariant(typeof key === 'string', 'Encryption key must be a text');

    const riskResponse = await castleRisk(request, await getUser(userId), {
      type: '$custom',
      name: 'Create budget',
    });

    if (riskResponse.risk > 0.9) {
      // TODO: Show error about risk too high
      return redirect('/budgets');
    }

    const budget = await createBudget(userId, { name, key });
    return redirect(`/budgets/${budget.budgetId}`);
  } catch (e) {
    console.error('Creating budget failed', e);
    // TODO: Handle errors notifications
    return redirect('/budgets/new');
  }
}

export default function () {
  const submit = useSubmit();
  const castle = useCastle();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await generateEncryptionKey();
    const formData = new FormData(event.target as HTMLFormElement);

    const name = await encrypt(formData.get('name') as string, encryptionKey);
    const key = await lockKey(encryptionKey);
    const requestToken = (await castle?.createRequestToken()) || '';

    submit({ name, key, requestToken }, { method: 'post' });
  };

  return (
    <>
      <a href="/budgets">Go back</a>
      <h2>Create new budget</h2>
      <BudgetForm onSubmit={handleSubmit} submit="Create budget!" />
    </>
  );
}
