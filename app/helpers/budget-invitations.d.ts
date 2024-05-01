import type { BudgetInvitation, User } from '@prisma/client';

export type ClientBudgetInvitation = Omit<BudgetInvitation, 'data'> & {
  budget: string;
  key: string;
  user: string;
};

export type BudgetInvitationsLayoutContext = {
  invitations: ClientBudgetInvitation[];
  user: User;
};
