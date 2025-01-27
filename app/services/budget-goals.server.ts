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

export const createBudgetGoal = async (
  userId: number,
  budgetId: number,
  freeSavings: string,
  data: Omit<
    BudgetGoal,
    'budgetId' | 'id' | 'priority' | 'createdAt' | 'updatedAt'
  >,
): Promise<BudgetGoal> =>
  await prisma.$transaction(async (tx) => {
    // TODO: Does this ensure budget exists and user has access to it?
    await tx.budget.update({
      where: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      data: { freeSavings },
    });

    const priority =
      (await tx.budgetGoal.count({
        where: {
          type: data.type,
          budgetId,
        },
      })) + 1;

    return tx.budgetGoal.create({
      data: {
        ...data,
        budgetId,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

export const updateBudgetGoal = (
  userId: number,
  budgetId: number,
  goalId: number,
  freeSavings: string,
  goals: BudgetGoal[],
): Promise<BudgetGoal> =>
  prisma.$transaction(async (tx) => {
    // TODO: Does this ensure budget exists and user has access to it?
    await tx.budget.update({
      where: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      data: { freeSavings },
    });

    await Promise.all(
      goals.map((goal) =>
        tx.budgetGoal.update({
          where: {
            id: goal.id,
          },
          data: {
            ...getUpdatableGoalFields(goal),
            updatedAt: new Date().toISOString(),
          },
        }),
      ),
    );

    return tx.budgetGoal.findUniqueOrThrow({ where: { id: goalId } });
  });

export const deleteBudgetGoal = async (
  userId: number,
  budgetId: number,
  goalId: number,
  freeSavings: string,
  goals: BudgetGoal[],
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // TODO: Does this ensure budget exists and user has access to it?
    await tx.budget.update({
      where: {
        id: budgetId,
        users: {
          some: { userId },
        },
      },
      data: { freeSavings },
    });

    await tx.budgetGoal.delete({
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

    await Promise.all(
      goals.map((goal) =>
        tx.budgetGoal.update({
          where: {
            id: goal.id,
          },
          data: {
            ...getUpdatableGoalFields(goal),
            updatedAt: new Date().toISOString(),
          },
        }),
      ),
    );
  });
};

const getUpdatableGoalFields = pick<(keyof BudgetGoal)[]>([
  'name',
  'type',
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
          data: {
            ...getUpdatableGoalFields(goal),
            updatedAt: new Date().toISOString(),
          },
        }),
      ),
    );
  });
};
