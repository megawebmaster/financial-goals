import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, json } from '@remix-run/react';
import { render } from '@react-email/render';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { storeKeyMaterial } from '~/services/encryption.client';
import { createUser } from '~/services/user.server';
import { mailer } from '~/services/mail.server';
import NewAccount from '~/emails/new-account';
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

  return json({
    title: t('register.title'),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const data = await request.clone().formData();
    const user = await createUser(
      data.get('username') as string,
      data.get('password') as string,
    );
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'email',
    );
    await mailer.sendMail({
      to: user.username,
      html: render(<NewAccount name={user.username} t={t} />),
    });
  } catch (e) {
    console.error('Unable to create new user', e);
    // TODO: Show user exists?
    return redirect('/signup');
  }

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
      <h2>{t('register.page.title')}</h2>
      <Form method="post" onSubmit={handleSubmit}>
        <label htmlFor="username">{t('register.form.username')}</label>
        <input
          id="username"
          type="text"
          name="username"
          required
          autoComplete="username"
        />
        <label htmlFor="password">{t('register.form.password')}</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="password"
        />
        <button type="submit">{t('register.form.submit')}</button>
      </Form>
    </>
  );
}
