import {
  filter,
  find,
  map,
  max,
  pipe,
  prop,
  propEq,
  reduce,
  reduced,
  reject,
} from 'ramda';
import type { BudgetGoal } from '@prisma/client';

import { decrypt, encrypt } from '~/services/encryption.client';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';

export const decryptBudgetGoal = async (
  goal: BudgetGoal,
  key: CryptoKey,
): Promise<ClientBudgetGoal> => {
  const requiredAmount = await decrypt(goal.requiredAmount, key);
  const currentAmount = await decrypt(goal.currentAmount, key);

  return {
    ...goal,
    name: await decrypt(goal.name, key),
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    requiredAmount: parseFloat(requiredAmount),
    currentAmount: parseFloat(currentAmount),
  };
};

export const encryptBudgetGoal = async (
  goal: ClientBudgetGoal,
  key: CryptoKey,
): Promise<BudgetGoal> => ({
  ...goal,
  name: await encrypt(goal.name, key),
  requiredAmount: await encrypt(goal.requiredAmount.toString(10), key),
  currentAmount: await encrypt(goal.currentAmount.toString(10), key),
});

export const getCurrentGoal = (type: string, goals: ClientBudgetGoal[]) =>
  find(
    (goal) => goal.type === type && goal.currentAmount !== goal.requiredAmount,
    goals,
  );

export const removeGoal = (goalId: number) => reject(propEq(goalId, 'id'));
export const updateGoal = (
  goalId: number,
  updatedFields: Partial<ClientBudgetGoal>,
) =>
  map((goal: ClientBudgetGoal) =>
    goal.id === goalId
      ? {
          ...goal,
          ...updatedFields,
          currentAmount:
            updatedFields.type !== goal.type
              ? 0
              : updatedFields.currentAmount || goal.currentAmount,
        }
      : goal,
  );

export const buildAmountToSaveCalculator =
  (baseSavingsAmount: number, goals: ClientBudgetGoal[]) =>
  (goalId: number): number =>
    reduce((amountToSave, goal: ClientBudgetGoal) => {
      const amount =
        baseSavingsAmount +
        amountToSave +
        (goal.requiredAmount - goal.currentAmount);
      if (goal.id === goalId) {
        return reduced(amount);
      }

      return amount;
    }, 0)(goals);

export const getGoalPriority = (
  goal: ClientBudgetGoal,
  type: string,
  goals: ClientBudgetGoal[],
): number => {
  if (goal.type !== type) {
    return (
      pipe(
        filter(propEq(type, 'type')),
        map<ClientBudgetGoal, number>(prop('priority')),
        reduce(max<number>, 0),
      )(goals) + 1
    );
  }

  return goal.priority;
};
