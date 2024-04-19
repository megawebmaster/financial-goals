import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Response } from '@remix-run/web-fetch';

import { authenticator } from '~/services/auth.server';
import { getUserPK } from '~/services/user.server';
import { LOGIN_ROUTE } from '~/routes';

export async function action({ request }: ActionFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  try {
    const data = await request.formData();
    const email = data.get('username') as string;

    return {
      email,
      key: await getUserPK(email),
    };
  } catch (e) {
    return new Response('User not found', { status: 403 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
