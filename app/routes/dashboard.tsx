import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { ENCRYPTION_STATUS, useEncryption } from '~/hooks/useEncryption';
import { clearEncryption } from '~/services/encryption.client';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Dashboard',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    return redirect('/');
  }

  return {
    user: await getUser(userId),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/',
  });
}

export default function () {
  const data = useLoaderData<typeof loader>();
  const status = useEncryption(data.user);

  if (status === ENCRYPTION_STATUS.LOADING) {
    return 'Loading…';
  }

  const handleSubmit = () => {
    clearEncryption();
  };

  return (
    <>
      <p>Logged in as: {data.user.username}</p>
      {status === ENCRYPTION_STATUS.ERROR && (
        <p>An error occurred when preparing encryption.</p>
      )}
      <Form method="post" onSubmit={handleSubmit}>
        <button>Log out</button>
      </Form>
    </>
  );
}
