import type { BudgetGoal, BudgetGoalEntry } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const getBudgetGoals = (userId: number, budgetId: number) =>
  prisma.budgetGoal.findMany({
    include: {
      entries: true,
    },
    where: {
      budget: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      status: 'active',
    },
    orderBy: {
      priority: 'asc',
    },
  });

export const getBudgetGoal = (
  userId: number,
  budgetId: number,
  goalId: number,
) =>
  prisma.budgetGoal.findFirstOrThrow({
    include: {
      entries: true,
    },
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
    await tx.budgetUser.findFirstOrThrow({
      where: {
        budgetId,
        userId,
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
        priority,
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
  priority: number,
  goalEntries: Pick<BudgetGoalEntry, 'goalId' | 'value'>[],
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

    const goalsCount = await tx.budgetGoal.count({
      where: {
        budget: {
          id: budgetId,
          users: {
            some: { userId },
          },
        },
        status: 'active',
      },
    });

    if (priority < 1) {
      return;
    }
    if (priority > goalsCount) {
      return;
    }

    await tx.budgetGoal.updateMany({
      where: {
        budgetId,
        priority: {
          ...(priority > goal.priority
            ? { lte: priority, gt: goal.priority }
            : { lt: goal.priority, gte: priority }),
        },
      },
      data: {
        priority: {
          ...(priority > goal.priority ? { decrement: 1 } : { increment: 1 }),
        },
      },
    });
    await tx.budgetGoal.update({
      where: {
        id: goalId,
      },
      data: {
        priority,
      },
    });
    await tx.budgetGoalEntry.deleteMany({
      where: {
        goal: {
          status: 'active',
        },
      },
    });
    await Promise.all(
      goalEntries.map((entry) =>
        tx.budgetGoalEntry.create({
          data: {
            ...entry,
            userId, // TODO: How to keep money from correct users?
          },
        }),
      ),
    );
  });
};
