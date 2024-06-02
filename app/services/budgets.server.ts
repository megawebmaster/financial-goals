import type {
  Budget as BaseBudget,
  BudgetInvitation,
  BudgetUser,
} from '@prisma/client';
import { addDays } from 'date-fns';

import type { ThenArg } from '~/helpers/types';
import { prisma } from '~/services/db.server';

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

export const getDefaultBudget = (userId: number): Promise<BudgetUser> =>
  prisma.budgetUser.findFirstOrThrow({
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

export const shareBudget = (
  userId: number,
  budgetId: number,
  username: string,
  data: string,
): Promise<BudgetInvitation> =>
  prisma.$transaction(async (tx) => {
    await fetchBudget(userId, budgetId);
    const user = await tx.user.findFirstOrThrow({ where: { username } });
    return tx.budgetInvitation.create({
      data: {
        budgetId,
        data,
        userId: user.id,
        expiresAt: addDays(new Date(), 3),
      },
    });
  });
