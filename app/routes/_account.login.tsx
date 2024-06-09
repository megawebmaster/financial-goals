import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { redirectWithError } from 'remix-toast';

import { INDEX_ROUTE, LOGIN_ROUTE } from '~/routes';
import { referrerCookie } from '~/helpers/auth';
import { authenticator } from '~/services/auth.server';
import { sessionStorage } from '~/services/session.server';
import { LoginForm } from '~/components/login-form';
import i18next from '~/i18n.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);
  const referer =
    (await referrerCookie.parse(request.headers.get('cookie'))) || INDEX_ROUTE;

  if (userId) {
    return redirect(referer);
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return json(
    {
      referer,
      title: t('login.title'),
    },
    {
      headers: {
        'Set-Cookie': await referrerCookie.serialize(''),
      },
    },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.clone().formData();
  const referer = data.get('referer') as string;

  try {
    const user = await authenticator.authenticate('user-pass', request);

    // Log in the user
    const session = await sessionStorage.getSession(
      request.headers.get('cookie'),
    );
    session.set(authenticator.sessionKey, user);

    return redirect(referer || INDEX_ROUTE, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    });
  } catch (e) {
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'errors',
    );

    return redirectWithError(
      LOGIN_ROUTE,
      { message: t('user.invalid-login') },
      { headers: { referer } },
    );
  }
}

export default function () {
  const { referer } = useLoaderData<typeof loader>();

  return <LoginForm referer={referer} />;
}
