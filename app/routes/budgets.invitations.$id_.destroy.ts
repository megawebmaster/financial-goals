import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { declineInvitation } from '~/services/budget-invitations.server';
import { LOGIN_ROUTE } from '~/routes';

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  try {
    invariant(params.id, 'Invitations ID is required');
    invariant(typeof params.id === 'string');

    await declineInvitation(params.id, userId);
    return redirect('/budgets/invitations');
  } catch (e) {
    console.error('Deleting invitations failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/invitations/${params.id}`);
  }
}
