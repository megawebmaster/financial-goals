import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { LOGIN_ROUTE } from '~/routes';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (userId) {
    return redirect('/budgets');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets',
    failureRedirect: LOGIN_ROUTE,
  });
}
