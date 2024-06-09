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
  budgetData: Omit<BaseBudget, 'id'>,
  budgetUserdata: Omit<BudgetUser, 'budgetId' | 'userId' | 'isOwner'>,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({ data: budgetData });

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
      },
    });
  });

export const updateBudget = (
  userId: number,
  budgetId: number,
  data: Partial<Omit<BudgetUser, 'budgetId' | 'userId' | 'key' | 'isOwner'>>,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      const result = await tx.budgetUser.updateMany({
        where: { isDefault: true, userId },
        data: { isDefault: false },
      });

      if (result.count > 0) {
        return tx.budgetUser.update({
          data,
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
      data: omit(['isDefault'], data),
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
