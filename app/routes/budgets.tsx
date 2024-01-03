import { useEffect } from 'react';
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
import { useCastle } from '~/contexts/CastleContextProvider';

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

  try {
    return {
      user: await getUser(userId),
    };
  } catch (e) {
    // TODO: Handle logged out notification
    return await authenticator.logout(request, {
      redirectTo: '/',
    });
  }
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const data = await serverLoader<typeof loader>();
  await buildWrappingKey(data.user.salt);

  return data;
}

export default function () {
  const castle = useCastle();
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    castle?.page({
      user: {
        id: data.user.id.toString(),
        name: data.user.username,
      },
    });
  }, [castle, data.user.id, data.user.username]);

  return (
    <>
      <p>Logged in as: {data.user.username}</p>
      <Form method="post">
        <button type="submit">Log out</button>
      </Form>
      <Form action="/user/destroy" method="post">
        <button type="submit">Delete account</button>
      </Form>
      <Outlet context={data} />
    </>
  );
}
