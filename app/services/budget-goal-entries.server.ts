import type { BudgetGoalEntry } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const createBudgetGoalEntry = async (
  userId: number,
  budgetId: number,
  goalId: number,
  data: Omit<BudgetGoalEntry, 'goalId' | 'id' | 'userId'>,
): Promise<BudgetGoalEntry> =>
  await prisma.$transaction(async (tx) => {
    await tx.budgetUser.findFirstOrThrow({
      where: {
        budgetId,
        userId,
      },
    });

    return tx.budgetGoalEntry.create({
      data: {
        ...data,
        goalId,
        userId,
      },
    });
  });
