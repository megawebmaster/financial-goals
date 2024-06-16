import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { redirectWithError } from 'remix-toast';

import { DecryptingMessage } from '~/components/decrypting-message';
import { authenticatedLoader } from '~/helpers/auth';
import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { useBudgetInvitations } from '~/hooks/useBudgetInvitations';
import { getInvitations } from '~/services/budget-invitations.server';
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
  const { user: currentUser } = useOutletContext<AuthenticatedLayoutContext>();
  const { invitations, loadingInvitations } = useBudgetInvitations(
    currentUser,
    data.invitations,
  );

  if (loadingInvitations) {
    return <DecryptingMessage />;
  }

  return (
    <Outlet
      context={
        {
          invitations,
          user: currentUser,
        } as BudgetInvitationsLayoutContext
      }
    />
  );
}
