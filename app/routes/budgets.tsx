import { type FormEvent, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from '@remix-run/react';
import { useSubmit, Form, Outlet, useLoaderData } from '@remix-run/react';
import { InvalidRequestTokenError } from '@castleio/sdk';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import {
  buildWrappingKey,
  clearEncryption,
} from '~/services/encryption.client';
import { useCastle } from '~/contexts/CastleContextProvider';
import { castleRisk } from '~/services/castle.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await authenticator.isAuthenticated(request.clone());

    if (!userId) {
      return redirect('/');
    }

    const user = await getUser(userId);
    const riskResult = await castleRisk(request.clone(), user, {
      type: '$logout',
      status: '$succeeded',
    });
    if (riskResult.risk > 0.9) {
      console.error('Logout risk is high!');
      // TODO: Show error that you cannot be logged out
      return redirect('/budgets');
    }
  } catch (e) {
    if (e instanceof InvalidRequestTokenError) {
      console.error('Logout invalid request token!');
      // TODO: Show error that you cannot be logged out
      return redirect('/budgets');
    }
  }

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
  const submit = useSubmit();
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

  const handleLogout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requestToken = (await castle?.createRequestToken()) || '';
    submit({ requestToken }, { method: 'post' });
  };

  return (
    <>
      <p>Logged in as: {data.user.username}</p>
      <form method="post" onSubmit={handleLogout}>
        <button type="submit">Log out</button>
      </form>
      <Form action="/user/destroy" method="post">
        <button type="submit">Delete account</button>
      </Form>
      <Outlet context={data} />
    </>
  );
}
