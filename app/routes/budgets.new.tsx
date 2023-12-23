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

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Create budget',
  },
];

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  const data = await request.formData();
  const name = data.get('name');
  const key = data.get('key');

  invariant(name, 'Name of the budget is required');
  invariant(typeof name === 'string', 'Name must be a text');
  invariant(key, 'Budget encryption key is required');
  invariant(typeof key === 'string', 'Encryption key must be a text');

  await createBudget(userId, { name, key });
  return redirect('/budgets');
}

export default function () {
  const submit = useSubmit();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await generateEncryptionKey();
    const formData = new FormData(event.target as HTMLFormElement);

    const name = await encrypt(formData.get('name') as string, encryptionKey);
    const key = await lockKey(encryptionKey);

    submit({ name, key }, { method: 'post' });
  };

  return (
    <>
      <h2>Create new budget</h2>
      <BudgetForm onSubmit={handleSubmit} submit="Create!" />
    </>
  );
}
