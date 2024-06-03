import type { BudgetInvitation } from '@prisma/client';
import { addDays } from 'date-fns';

import { prisma } from '~/services/db.server';

export const getInvitation = (id: string, userId: number) =>
  prisma.budgetInvitation.findFirstOrThrow({
    where: {
      id,
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

export const getInvitations = (userId: number) =>
  prisma.budgetInvitation.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

export class BudgetAlreadySharedError extends Error {}

export const shareBudget = (
  userId: number,
  budgetId: number,
  email: string,
  data: string,
): Promise<BudgetInvitation> =>
  prisma.$transaction(async (tx) => {
    await tx.budgetUser.findFirstOrThrow({ where: { budgetId, userId } });
    const user = await tx.user.findFirstOrThrow({ where: { email } });

    if (
      await tx.budgetUser.findFirst({ where: { budgetId, userId: user.id } })
    ) {
      throw new BudgetAlreadySharedError();
    }

    return tx.budgetInvitation.create({
      data: {
        budgetId,
        data,
        userId: user.id,
        expiresAt: addDays(new Date(), 3),
      },
    });
  });

export const acceptInvitation = (
  id: string,
  userId: number,
  name: string,
  key: string,
) =>
  prisma.$transaction(async (tx) => {
    const invitation = await tx.budgetInvitation.findFirstOrThrow({
      where: {
        id,
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const budget = await tx.budgetUser.create({
      data: {
        budgetId: invitation.budgetId,
        isOwner: false,
        key,
        name,
        userId,
      },
    });

    await tx.budgetInvitation.delete({ where: { id } });

    return budget;
  });

export const declineInvitation = (id: string, userId: number) =>
  prisma.budgetInvitation.delete({ where: { id, userId } });
