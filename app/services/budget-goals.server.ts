import type { BudgetGoal } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const getBudgetGoals = (
  userId: number,
  budgetId: number,
): Promise<BudgetGoal[]> =>
  prisma.budgetGoal.findMany({
    where: {
      budget: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
    },
  });

export const getBudgetGoal = (
  userId: number,
  budgetId: number,
  goalId: number,
): Promise<BudgetGoal> =>
  prisma.budgetGoal.findFirstOrThrow({
    where: {
      id: goalId,
      budget: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
    },
  });

export const createBudgetGoal = (
  userId: number,
  budgetId: number,
  data: Omit<BudgetGoal, 'budgetId' | 'id'>,
): Promise<BudgetGoal> =>
  prisma.$transaction(async (tx) => {
    await tx.budget.findFirstOrThrow({
      where: {
        id: budgetId,
        users: {
          some: {
            userId,
          },
        },
      },
    });

    return tx.budgetGoal.create({
      data: {
        ...data,
        budgetId,
      },
    });
  });

export const updateBudgetGoal = (
  userId: number,
  budgetId: number,
  goalId: number,
  data: Partial<Omit<BudgetGoal, 'budgetId' | 'id'>>,
): Promise<BudgetGoal> =>
  prisma.budgetGoal.update({
    data,
    where: {
      budget: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      id: goalId,
    },
  });

export const deleteBudgetGoal = async (
  userId: number,
  budgetId: number,
  goalId: number,
): Promise<void> => {
  await prisma.budgetGoal.delete({
    where: {
      budget: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      id: goalId,
    },
  });
};
