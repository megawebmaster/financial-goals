import type { BudgetGoalEntry, BudgetSavingsEntry } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const createSavingsEntry = async (
  userId: number,
  budgetId: number,
  value: string,
  goalEntries: Pick<BudgetGoalEntry, 'goalId' | 'value'>[],
): Promise<BudgetSavingsEntry> =>
  await prisma.$transaction(async (tx) => {
    await tx.budgetUser.findFirstOrThrow({
      where: {
        budgetId,
        userId,
      },
    });

    const entry = tx.budgetSavingsEntry.create({
      data: {
        value,
        userId,
      },
    });

    await Promise.all(
      goalEntries.map(async (goalEntry) =>
        tx.budgetGoalEntry.create({
          data: {
            ...goalEntry,
            userId,
          },
        }),
      ),
    );

    return entry;
  });
