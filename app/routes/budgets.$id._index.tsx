import type { FormEvent } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { pipe } from 'ramda';
import { unlockKey } from '~/services/encryption.client';
import {
  buildGoalsFiller,
  buildGoalsSorting,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import type { BudgetsLayoutContext } from '~/helpers/budgets';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Your budget',
  },
];

export default function () {
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
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
      processGoals(goals).map((item) => encryptBudgetGoal(item, encryptionKey)),
    );

    submit(
      { goals: JSON.stringify(updatedGoals) },
      {
        action: `/budgets/${budget.budgetId}/goals/priority`,
        method: 'post',
      },
    );
  };

  return (
    <>
      <a href="/budgets">Go back</a>
      <h2>
        Your budget: {budget.name}{' '}
        <a href={`/budgets/${budget.budgetId}/edit`}>Edit</a>
      </h2>
      <p>
        <strong>Current savings:</strong> {budget.currentSavings}
      </p>
      {budget.freeSavings > 0 && (
        <p>
          <strong>Free, unused savings:</strong> {budget.freeSavings}
        </p>
      )}
      <h3>Goals:</h3>
      {goals.length === 0 && <p>No goals yet!</p>}
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.name} - {goal.requiredAmount} (
            {Math.round((goal.currentAmount / goal.requiredAmount) * 100)}
            %){' '}
            <a href={`/budgets/${budget.budgetId}/goals/${goal.id}/edit`}>
              Edit
            </a>{' '}
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="goalId" value={goal.id} />
              <input type="hidden" name="priority" value={goal.priority - 1} />
              <button type="submit">Move up</button>
            </form>{' '}
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="goalId" value={goal.id} />
              <input type="hidden" name="priority" value={goal.priority + 1} />
              <button type="submit">Move down</button>
            </form>
          </li>
        ))}
      </ul>
      <a href={`/budgets/${budget.budgetId}/goals/new`}>Create goal</a>
      <br />
      <a href={`/budgets/${budget.budgetId}/savings/new`}>Add savings</a>
    </>
  );
}
