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
import { redirectWithError } from 'remix-toast';

import { authenticator } from '~/services/auth.server';
import { storeKeyMaterial } from '~/services/encryption.client';
import { createUser, UserExistsError } from '~/services/user.server';
import { mailer } from '~/services/mail.server';
import { LOGIN_ROUTE } from '~/routes';
import NewAccountEmail from '~/emails/new-account-email';
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
      subject: t('new-account.subject'),
      html: render(<NewAccountEmail name={user.username} t={t} />),
    });
  } catch (e) {
    console.error('Unable to create new user', e);
    // TODO: Why can new account creation fail? Improve user experience here
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    const error =
      e instanceof UserExistsError ? 'user.exists' : 'signup.failed';

    return redirectWithError('/signup', { message: t(error) });
  }

  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets',
    failureRedirect: LOGIN_ROUTE,
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
          type="email"
          name="username"
          required
          autoComplete="email"
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
