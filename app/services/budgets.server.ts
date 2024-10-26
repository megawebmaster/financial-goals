import type { Budget as BaseBudget, BudgetUser } from '@prisma/client';
import { omit } from 'ramda';

import type { ArrayElement, ThenArg } from '~/helpers/types';
import { prisma } from '~/services/db.server';

const fetchBudgets = (userId: number) =>
  prisma.budgetUser.findMany({
    include: {
      budget: true,
    },
    where: {
      userId,
    },
  });

export type ServerBudget = ArrayElement<
  ThenArg<ReturnType<typeof fetchBudgets>>
>;

export const getBudget = (budgetId: number, userId: number) =>
  prisma.budgetUser.findUniqueOrThrow({
    where: {
      budgetId_userId: {
        budgetId,
        userId,
      },
    },
  });

export const getBudgets = (userId: number): Promise<ServerBudget[]> =>
  fetchBudgets(userId);

export const getDefaultBudget = (userId: number): Promise<BudgetUser | null> =>
  prisma.budgetUser.findFirst({
    where: {
      isDefault: true,
      userId,
    },
  });

export const createBudget = (
  userId: number,
  budgetData: Omit<BaseBudget, 'id' | 'createdAt' | 'updatedAt'>,
  budgetUserdata: Omit<
    BudgetUser,
    'budgetId' | 'userId' | 'isOwner' | 'createdAt' | 'updatedAt'
  >,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({
      data: {
        ...budgetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    if (budgetUserdata.isDefault) {
      await tx.budgetUser.updateMany({
        where: { isDefault: true, userId },
        data: { isDefault: false },
      });
    }

    return tx.budgetUser.create({
      data: {
        ...budgetUserdata,
        budgetId: budget.id,
        userId,
        isOwner: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

export const updateBudget = (
  userId: number,
  budgetId: number,
  budgetData: Partial<
    Omit<
      BaseBudget,
      'id' | 'currentSavings' | 'freeSavings' | 'createdAt' | 'updatedAt'
    >
  >,
  budgetUserdata: Partial<
    Omit<
      BudgetUser,
      'budgetId' | 'userId' | 'key' | 'isOwner' | 'createdAt' | 'updatedAt'
    >
  >,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    // Ensure access to the budget
    await tx.budgetUser.findUniqueOrThrow({
      where: {
        budgetId_userId: {
          budgetId,
          userId,
        },
      },
    });

    await tx.budget.update({
      data: budgetData,
      where: { id: budgetId },
    });

    if (budgetUserdata.isDefault) {
      const result = await tx.budgetUser.updateMany({
        where: { isDefault: true, userId },
        data: {
          isDefault: false,
          updatedAt: new Date().toISOString(),
        },
      });

      if (result.count > 0) {
        return tx.budgetUser.update({
          data: {
            ...budgetUserdata,
            updatedAt: new Date().toISOString(),
          },
          where: {
            budgetId_userId: {
              budgetId,
              userId,
            },
          },
        });
      }
    }

    return tx.budgetUser.update({
      data: {
        ...omit(['isDefault'], budgetUserdata),
        updatedAt: new Date().toISOString(),
      },
      where: {
        budgetId_userId: {
          budgetId,
          userId,
        },
      },
    });
  });

export const deleteBudget = (userId: number, budgetId: number): Promise<void> =>
  prisma.$transaction(async (tx) => {
    await tx.budgetUser.delete({
      where: {
        budgetId_userId: {
          budgetId,
          userId,
        },
      },
    });

    // If budget has no other users - delete it
    const usersCount = await tx.budgetUser.count({
      where: { budgetId },
    });
    if (usersCount === 0) {
      await tx.budget.delete({ where: { id: budgetId } });
    }
  });
