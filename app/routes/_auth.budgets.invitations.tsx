import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import type { User } from '@prisma/client';
import { redirectWithError } from 'remix-toast';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { authenticatedLoader } from '~/helpers/auth';
import { getInvitations } from '~/services/budget-invitations.server';
import { BudgetInvitationsList } from '~/components/budget-invitations-list';
import { DecryptingMessage } from '~/components/decrypting-message';
import i18next from '~/i18n.server';

export const loader = authenticatedLoader(async ({ request }, userId) => {
  try {
    return {
      invitations: await getInvitations(userId),
    };
  } catch (e) {
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    return redirectWithError('/', { message: t('budget.not-found') });
  }
});

export default function () {
  const data = useLoaderData<typeof loader>();
  const currentUser = useOutletContext<User>();

  return (
    <BudgetInvitationsList
      invitations={data.invitations}
      currentUser={currentUser}
    >
      <BudgetInvitationsList.Pending>
        <DecryptingMessage />
      </BudgetInvitationsList.Pending>
      <BudgetInvitationsList.Fulfilled>
        {(invitations) => (
          <Outlet
            context={
              {
                invitations,
                user: currentUser,
              } as BudgetInvitationsLayoutContext
            }
          />
        )}
      </BudgetInvitationsList.Fulfilled>
    </BudgetInvitationsList>
  );
}
