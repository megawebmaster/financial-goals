import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { getBudget } from '~/services/budgets.server';
import type { FormEvent } from 'react';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { getBudgetGoals } from '~/services/budget-goals.server';
import { BudgetSavingsEntryForm } from '~/components/budget-savings-entry-form';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import { encryptBudgetSavingsEntry } from '~/services/budget-savings-entries.client';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import { getGoalsSum } from '~/helpers/budget-goals';
import type { BudgetsLayoutContext } from '~/helpers/budgets';

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
    const budgetData = data.get('budgetData');
    const goals = data.get('goals');

    invariant(entryValue, 'Value for entry is required');
    invariant(typeof entryValue === 'string');
    invariant(budgetData, 'Budget data is required');
    invariant(typeof budgetData === 'string');
    invariant(goals, 'Goals are required');
    invariant(typeof goals === 'string');

    await createSavingsEntry(
      userId,
      budgetId,
      JSON.parse(budgetData),
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

const getGoalsCurrentAmount = getGoalsSum('currentAmount');

export default function () {
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);

    const date = new Date(formData.get('date') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const currentSavings = budget.currentSavings + amount;
    const processGoals = buildGoalsFiller(currentSavings);
    const updatedGoals = processGoals(goals);
    const freeSavings = currentSavings - getGoalsCurrentAmount(updatedGoals);
    const entryValue = await encryptBudgetSavingsEntry(
      // TODO: Why did I decide to encrypt date here?
      date,
      amount,
      encryptionKey,
    );

    submit(
      {
        entryValue,
        budgetData: JSON.stringify({
          currentSavings: await encrypt(
            currentSavings.toString(10),
            encryptionKey,
          ),
          freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
        }),
        goals: JSON.stringify(
          await Promise.all(
            updatedGoals.map((item) => encryptBudgetGoal(item, encryptionKey)),
          ),
        ),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <a href={`/budgets/${budget.budgetId}`}>Go back</a>
      <h2>Add savings to {budget.name} budget</h2>
      <BudgetSavingsEntryForm
        budget={budget}
        onSubmit={handleSubmit}
        submit="Add savings!"
      />
    </>
  );
}
