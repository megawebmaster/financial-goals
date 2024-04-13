import type { Budget, BudgetGoal, BudgetSavingsEntry } from '@prisma/client';
import { pick } from 'ramda';

import { prisma } from '~/services/db.server';

const getCurrentAmount = pick<(keyof BudgetGoal)[]>(['currentAmount']);

export const createSavingsEntry = async (
  userId: number,
  budgetId: number,
  budgetData: Omit<Budget, 'id'>,
  entryValue: string,
  goals: BudgetGoal[],
): Promise<BudgetSavingsEntry> =>
  await prisma.$transaction(async (tx) => {
    // TODO: Does this update ensure the budget exists?
    await tx.budget.update({
      data: budgetData,
      where: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
    });

    const entry = await tx.budgetSavingsEntry.create({
      data: {
        value: entryValue,
        userId,
      },
    });

    await Promise.all(
      goals.map(async (goal) =>
        tx.budgetGoal.update({
          where: {
            id: goal.id,
          },
          data: getCurrentAmount(goal),
        }),
      ),
    );

    return entry;
  });
