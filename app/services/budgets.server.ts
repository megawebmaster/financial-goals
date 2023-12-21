import type { BudgetUser } from '@prisma/client';

import { prisma } from '~/services/db.server';

export const getBudgets = (userId: number): Promise<BudgetUser[]> =>
  prisma.budgetUser.findMany({ where: { userId } });

export const createBudget = (
  userId: number,
  data: Omit<BudgetUser, 'budgetId' | 'userId' | 'isOwner'>,
): Promise<BudgetUser> =>
  prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({ data: {} });
    return tx.budgetUser.create({
      data: {
        ...data,
        budgetId: budget.id,
        userId,
        isOwner: true,
      },
    });
  });
