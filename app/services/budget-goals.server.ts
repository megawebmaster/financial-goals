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
    orderBy: {
      priority: 'asc',
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

export const createBudgetGoal = async (
  userId: number,
  budgetId: number,
  data: Omit<BudgetGoal, 'budgetId' | 'id' | 'priority'>,
): Promise<BudgetGoal> =>
  await prisma.$transaction(async (tx) => {
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

    const priority = await tx.budgetGoal.count({
      where: {
        budgetId,
      },
    });

    return tx.budgetGoal.create({
      data: {
        ...data,
        budgetId,
        priority: priority + 1,
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

export const updateBudgetGoalPriority = async (
  userId: number,
  budgetId: number,
  goalId: number,
  direction: 'up' | 'down',
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const goal = await tx.budgetGoal.findFirstOrThrow({
      select: {
        priority: true,
      },
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

    const delta = direction === 'up' ? -1 : 1;
    const goalsCount = await tx.budgetGoal.count({
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

    if (goal.priority === 1 && direction === 'up') {
      return;
    }
    if (goal.priority === goalsCount && direction === 'down') {
      return;
    }

    await tx.budgetGoal.updateMany({
      where: {
        budgetId,
        priority: goal.priority + delta,
      },
      data: {
        priority: goal.priority,
      },
    });
    await tx.budgetGoal.update({
      where: {
        id: goalId,
      },
      data: {
        priority: goal.priority + delta,
      },
    });
  });
};
