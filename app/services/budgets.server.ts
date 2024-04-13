import type { Budget as BaseBudget, BudgetUser } from '@prisma/client';

import { prisma } from '~/services/db.server';
import type { ThenArg } from '~/helpers/types';

export const getBudgets = (userId: number): Promise<BudgetUser[]> =>
  prisma.budgetUser.findMany({ where: { userId } });

const fetchBudget = (userId: number, budgetId: number) =>
  prisma.budgetUser.findFirstOrThrow({
    include: {
      budget: true,
    },
    where: {
      budgetId,
      userId,
    },
  });

export type Budget = ThenArg<ReturnType<typeof fetchBudget>>;

export const getBudget = (userId: number, budgetId: number): Promise<Budget> =>
  fetchBudget(userId, budgetId);

export const createBudget = (
  userId: number,
  budgetData: Omit<BaseBudget, 'id'>,
  budgetUserdata: Omit<BudgetUser, 'budgetId' | 'userId' | 'isOwner'>,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({ data: budgetData });
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
  prisma.budgetUser.update({
    data,
    where: {
      budgetId_userId: {
        budgetId,
        userId,
      },
    },
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
