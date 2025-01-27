import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/react';
import { render } from '@react-email/render';
import { redirectWithError } from 'remix-toast';

import { authenticator } from '~/services/auth.server';
import { createUser, UserExistsError } from '~/services/user.server';
import { mailer } from '~/services/mail.server';
import { LOGIN_ROUTE } from '~/routes';
import { SignupForm } from '~/components/signup-form';
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
    return redirect('/');
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return json({
    title: t('register.title'),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const data = await request.clone().formData();
    const password = data.get('password') as string;
    const user = await createUser(
      data.get('username') as string,
      data.get('email') as string,
      password,
      (request.headers.get('Accept-Language') || 'en-US').split(',')[0],
    );

    let t = await i18next.getFixedT(await i18next.getLocale(request), 'email');
    await mailer.sendMail({
      to: user.email,
      subject: t('new-account.subject'),
      html: await render(<NewAccountEmail name={user.username} t={t} />),
    });
  } catch (e) {
    console.error('Unable to create new user', e);
    // TODO: Why can new account creation fail? Improve user experience here
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'errors',
    );

    const error =
      e instanceof UserExistsError ? 'user.exists' : 'signup.failed';

    return redirectWithError('/signup', { message: t(error) });
  }

  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets/new',
    failureRedirect: LOGIN_ROUTE,
  });
}

export default function () {
  return <SignupForm />;
}
