import type { Budget, BudgetGoal, BudgetSavingsEntry } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const createSavingsEntry = async (
  userId: number,
  budgetId: number,
  budgetData: Omit<Budget, 'id'>,
  entryData: Omit<BudgetSavingsEntry, 'id' | 'userId' | 'budgetId'>,
  goals: Pick<BudgetGoal, 'id' | 'currentAmount'>[],
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
        ...entryData,
        userId,
        budgetId,
      },
    });

    await Promise.all(
      goals.map(async (goal) =>
        tx.budgetGoal.update({
          where: {
            id: goal.id,
          },
          data: {
            currentAmount: goal.currentAmount,
          },
        }),
      ),
    );

    return entry;
  });
