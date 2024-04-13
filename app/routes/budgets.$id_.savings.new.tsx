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
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { GoalsList } from '~/components/budgets/goals-list';
import { BudgetSavingsEntryForm } from '~/components/budget-savings-entry-form';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import { encryptBudgetSavingsEntry } from '~/services/budget-savings-entries.client';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';

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
    const entryValue = data.get('entryValue');
    const currentSavingsValue = data.get('currentSavingsValue');
    const goals = data.get('goals');

    invariant(entryValue, 'Value for entry is required');
    invariant(typeof entryValue === 'string');
    invariant(currentSavingsValue, 'Current budget savings value is required');
    invariant(typeof currentSavingsValue === 'string');
    invariant(goals, 'Goals are required');
    invariant(typeof goals === 'string');

    await createSavingsEntry(
      userId,
      budgetId,
      currentSavingsValue,
      entryValue,
      JSON.parse(goals),
    );
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    // TODO: Handle errors notifications
    console.error('Creating entry failed', e);
    return redirect(`/budgets/${params.id}/savings/new`);
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
          {(budget) => (
            <>
              <h2>Add savings to {budget.name} budget</h2>
              <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
                <GoalsList.Pending>Decrypting data…</GoalsList.Pending>
                <GoalsList.Fulfilled>
                  {(goals) => {
                    const handleSubmit = async (
                      event: FormEvent<HTMLFormElement>,
                    ) => {
                      event.preventDefault();
                      const encryptionKey = await unlockKey(data.budget.key);
                      const formData = new FormData(
                        event.target as HTMLFormElement,
                      );

                      const date = new Date(formData.get('date') as string);
                      const amount = parseFloat(
                        formData.get('amount') as string,
                      );
                      const currentSavings = budget.currentSavings + amount;
                      const processGoals = buildGoalsFiller(currentSavings);

                      const updatedGoals = await Promise.all(
                        processGoals(goals).map((item) =>
                          encryptBudgetGoal(item, encryptionKey),
                        ),
                      );
                      const entryValue = await encryptBudgetSavingsEntry(
                        // TODO: Why did I decide to encrypt date here?
                        date,
                        amount,
                        encryptionKey,
                      );

                      submit(
                        {
                          entryValue,
                          currentSavingsValue: await encrypt(
                            currentSavings.toString(10),
                            encryptionKey,
                          ),
                          goals: JSON.stringify(updatedGoals),
                        },
                        { method: 'post' },
                      );
                    };

                    return (
                      <BudgetSavingsEntryForm
                        budget={data.budget}
                        onSubmit={handleSubmit}
                        submit="Add savings!"
                      />
                    );
                  }}
                </GoalsList.Fulfilled>
              </GoalsList>
            </>
          )}
        </Budget.Fulfilled>
      </Budget>
    </>
  );
}
