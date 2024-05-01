import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { deleteUser } from '~/services/user.server';
import { LOGIN_ROUTE } from '~/routes';

export async function action({ request }: ActionFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  try {
    await deleteUser(userId);
  } catch (e) {
    console.error('Unable to delete user', e);
    // TODO: Handle errors notifications
    return redirect('/budgets');
  }

  return await authenticator.logout(request, {
    redirectTo: '/',
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
