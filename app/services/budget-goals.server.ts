import type { BudgetGoal } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { pick } from 'ramda';

export const getBudgetGoals = (userId: number, budgetId: number) =>
  prisma.budgetGoal.findMany({
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

const getUpdateableGoalFields = pick<(keyof BudgetGoal)[]>([
  'name',
  'requiredAmount',
  'currentAmount',
  'priority',
  'status',
]);

export const updateBudgetGoalsPriority = async (
  userId: number,
  budgetId: number,
  goals: BudgetGoal[],
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Ensure user has access to the budget
    await tx.budget.findFirstOrThrow({
      where: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
    });

    await Promise.all(
      goals.map((goal) =>
        tx.budgetGoal.update({
          where: {
            id: goal.id,
          },
          data: getUpdateableGoalFields(goal),
        }),
      ),
    );
  });
};
