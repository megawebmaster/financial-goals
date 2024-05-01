import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import type { User } from '@prisma/client';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { authenticator } from '~/services/auth.server';
import { getInvitations } from '~/services/budget-invitations.server';
import { BudgetInvitationsList } from '~/components/budget-invitations-list';
import { LOGIN_ROUTE } from '~/routes';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  try {
    return {
      invitations: await getInvitations(userId),
    };
  } catch (e) {
    // TODO: Handle errors notifications
    return redirect('/');
  }
}

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();
  const currentUser = useOutletContext<User>();

  return (
    <BudgetInvitationsList
      invitations={data.invitations}
      currentUser={currentUser}
    >
      <BudgetInvitationsList.Pending>
        {t('budget-invitations.encryption.decrypting')}
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
