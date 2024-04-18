import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { storeKeyMaterial } from '~/services/encryption.client';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /budgets directly
  const userId = await authenticator.isAuthenticated(request);

  if (userId) {
    return redirect('/budgets');
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('login.title'),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets',
    failureRedirect: '/',
  });
}

export default function () {
  const { t } = useTranslation();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const password = data.get('password');

    if (password) {
      await storeKeyMaterial(password.toString());
    }
  };

  return (
    <>
      <h1>{t('app.name')}</h1>
      <Form method="post" onSubmit={handleSubmit}>
        <label htmlFor="username">{t('login.form.username')}</label>
        <input
          id="username"
          type="text"
          name="username"
          required
          autoComplete="username"
        />
        <label htmlFor="password">{t('login.form.password')}</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="password"
        />
        <button type="submit">{t('login.form.submit')}</button>
      </Form>
      <a href="/signup">{t('login.form.register')}</a>
    </>
  );
}
