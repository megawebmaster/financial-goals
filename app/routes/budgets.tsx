import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from '@remix-run/react';
import { Form, Outlet, useLoaderData } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import {
  buildWrappingKey,
  clearEncryption,
} from '~/services/encryption.client';

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/',
  });
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  await clearEncryption();
  return await serverAction();
}

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  return {
    user: await getUser(userId),
  };
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const data = await serverLoader<typeof loader>();
  await buildWrappingKey(data.user.salt);

  return data;
}

export default function () {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <p>Logged in as: {data.user.username}</p>
      <Form method="post">
        <button>Log out</button>
      </Form>
      <Outlet context={data} />
    </>
  );
}
