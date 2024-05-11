import type { ActionFunctionArgs } from '@remix-run/node';
import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from '@remix-run/react';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import {
  buildWrappingKey,
  clearEncryption,
} from '~/services/encryption.client';
import { authenticatedLoader } from '~/helpers/auth';

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/',
  });
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  await clearEncryption();
  return await serverAction();
}

export const loader = authenticatedLoader(async ({ request }, userId) => {
  try {
    return {
      user: await getUser(userId),
    };
  } catch (e) {
    return await authenticator.logout(request, {
      redirectTo: '/',
    });
  }
});

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const data = await serverLoader<typeof loader>();
  await buildWrappingKey(data.user.salt);

  return data;
}

export default function () {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('app.name')}</h1>
      <p>Logged in as: {user.username}</p>
      <Form method="post">
        <button type="submit">Log out</button>
      </Form>
      <Form action="/user/destroy" method="post">
        <button type="submit">Delete account</button>
      </Form>
      <Outlet context={user} />
    </>
  );
}
