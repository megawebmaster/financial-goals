import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getBudget, updateBudget } from '~/services/budgets.server';
import { BudgetForm } from '~/components/budget-form';
import { DecryptedBudget } from '~/components/decrypted-budget';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Update budget',
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

  return {
    budget: await getBudget(userId, budgetId),
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

  const data = await request.formData();
  const name = data.get('name');

  invariant(name, 'Name of the budget is required');
  invariant(typeof name === 'string', 'Name must be a text');

  await updateBudget(userId, budgetId, { name });
  return redirect('/budgets');
}

export default function () {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const encryptionKey = await unlockKey(data.budget.key);
    const formData = new FormData(event.target as HTMLFormElement);
    const name = await encrypt(formData.get('name') as string, encryptionKey);

    submit({ name }, { method: 'patch' });
  };

  return (
    <DecryptedBudget budget={data.budget}>
      <DecryptedBudget.Pending>Decrypting data…</DecryptedBudget.Pending>
      <DecryptedBudget.Fulfilled>
        {(budget) => (
          <>
            <h2>Update budget</h2>
            <BudgetForm
              budget={budget}
              onSubmit={handleSubmit}
              submit="Update!"
            />
            <Form action={`/budgets/${budget.budgetId}/destroy`} method="post">
              <button type="submit">Delete</button>
            </Form>
          </>
        )}
      </DecryptedBudget.Fulfilled>
    </DecryptedBudget>
  );
}
