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
import { BudgetGoalForm } from '~/components/budget-goal-form';
import type { FormEvent } from 'react';
import { encrypt, unlockKey } from '~/services/encryption.client';
import {
  getBudgetGoal,
  getBudgetGoals,
  updateBudgetGoal,
} from '~/services/budget-goals.server';
import { Goal } from '~/components/budgets/goal';
import { pipe } from 'ramda';
import {
  buildGoalsFiller,
  encryptBudgetGoal,
  removeGoal,
  updateGoal,
} from '~/services/budget-goals.client';
import { GoalsList } from '~/components/budgets/goals-list';
import { getGoalsSum } from '~/helpers/budget-goals';

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

  try {
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
      goals: await getBudgetGoals(userId, budgetId),
      goal: await getBudgetGoal(userId, budgetId, goalId),
    };
  } catch (e) {
    // TODO: Handle errors notifications
    return redirect('/');
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

    invariant(params.goalId, 'Goal ID is required');
    invariant(typeof params.goalId === 'string');

    const goalId = parseInt(params.goalId, 10);
    invariant(!isNaN(goalId), 'Goal ID must be a number');

    const data = await request.formData();
    const freeSavings = data.get('freeSavings');
    const goals = data.get('goals');

    invariant(freeSavings, 'Free budget savings is required');
    invariant(typeof freeSavings === 'string');
    invariant(goals, 'Updated goals are required');
    invariant(typeof goals === 'string');

    await updateBudgetGoal(
      userId,
      budgetId,
      goalId,
      freeSavings,
      JSON.parse(goals),
    );
    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    // TODO: Handle errors notifications
    console.error('Updating goal failed', e);
    return redirect('/');
  }
}

const getGoalsCurrentAmount = getGoalsSum('currentAmount');

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
            return (
              <>
                <h2>Update goal in {budget.name} budget</h2>
                <GoalsList encryptionKey={data.budget.key} goals={data.goals}>
                  <GoalsList.Pending>Decrypting goals…</GoalsList.Pending>
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
                        const name = formData.get('name') as string;
                        const requiredAmount = parseFloat(
                          formData.get('requiredAmount') as string,
                        );
                        const processGoals = pipe(
                          updateGoal(data.goal.id, { name, requiredAmount }),
                          buildGoalsFiller(budget.currentSavings),
                        );

                        const updatedGoals = processGoals(goals);
                        const freeSavings =
                          budget.currentSavings -
                          getGoalsCurrentAmount(updatedGoals);

                        submit(
                          {
                            freeSavings: await encrypt(
                              freeSavings.toString(10),
                              encryptionKey,
                            ),
                            goals: JSON.stringify(
                              await Promise.all(
                                updatedGoals.map((item) =>
                                  encryptBudgetGoal(item, encryptionKey),
                                ),
                              ),
                            ),
                          },
                          { method: 'patch' },
                        );
                      };

                      const handleDelete = async (
                        event: FormEvent<HTMLFormElement>,
                      ) => {
                        event.preventDefault();
                        const encryptionKey = await unlockKey(data.budget.key);

                        const processGoals = pipe(
                          removeGoal(data.goal.id),
                          buildGoalsFiller(budget.currentSavings),
                        );

                        const updatedGoals = processGoals(goals);
                        const freeSavings =
                          budget.currentSavings -
                          getGoalsCurrentAmount(updatedGoals);

                        submit(
                          {
                            freeSavings: await encrypt(
                              freeSavings.toString(10),
                              encryptionKey,
                            ),
                            goals: JSON.stringify(
                              await Promise.all(
                                updatedGoals.map((item) =>
                                  encryptBudgetGoal(item, encryptionKey),
                                ),
                              ),
                            ),
                          },
                          {
                            action: `/budgets/${budget.budgetId}/goals/${data.goal.id}/destroy`,
                            method: 'post',
                            replace: true,
                          },
                        );
                      };

                      return (
                        <>
                          <Goal
                            encryptionKey={data.budget.key}
                            goal={data.goal}
                          >
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
                          <form onSubmit={handleDelete}>
                            <button type="submit">Delete goal</button>
                          </form>
                        </>
                      );
                    }}
                  </GoalsList.Fulfilled>
                </GoalsList>
              </>
            );
          }}
        </Budget.Fulfilled>
      </Budget>
    </>
  );
}
