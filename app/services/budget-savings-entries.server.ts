import type { Budget, BudgetGoal, BudgetSavingsEntry } from '@prisma/client';
import { startOfMonth, subMonths } from 'date-fns';

import { prisma } from '~/services/db.server';

export const getBudgetSavings = (budgetId: number) =>
  prisma.budgetSavingsEntry.findMany({
    where: {
      budgetId,
      createdAt: {
        gte: startOfMonth(subMonths(new Date(), 12)),
      },
    },
  });

export const createSavingsEntry = async (
  userId: number,
  budgetId: number,
  budgetData: Partial<Omit<Budget, 'id'>>,
  entryData: Partial<Omit<BudgetSavingsEntry, 'id' | 'userId' | 'budgetId'>>,
  goals: Partial<Pick<BudgetGoal, 'id' | 'currentAmount'>>[],
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
        createdAt: (entryData.createdAt || new Date()).toISOString(),
        updatedAt: (
          entryData.updatedAt ||
          entryData.createdAt ||
          new Date()
        ).toISOString(),
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
            updatedAt: new Date().toISOString(),
          },
        }),
      ),
    );

    return entry;
  });
