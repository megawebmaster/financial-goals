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
import { createBudget } from '~/services/budgets.server';
import {
  encrypt,
  generateEncryptionKey,
  generateKeyMaterial,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';
import { mailer } from '~/services/mail.server';
import { LOGIN_ROUTE } from '~/routes';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageBody } from '~/components/ui/page-body';
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
  let budget;

  try {
    const data = await request.clone().formData();
    const user = await createUser(
      data.get('username') as string,
      data.get('email') as string,
      data.get('password') as string,
    );

    const wrappingKey = await generateWrappingKey(
      await generateKeyMaterial('test'),
      user.salt,
    );
    const encryptionKey = await generateEncryptionKey();
    const encryptedZero = await encrypt('0', encryptionKey);

    let t = await i18next.getFixedT(await i18next.getLocale(request), 'common');
    budget = await createBudget(
      user.id,
      {
        currentSavings: encryptedZero,
        freeSavings: encryptedZero,
      },
      {
        name: await encrypt(t('budget.new.default-name'), encryptionKey),
        key: await lockKey(wrappingKey, encryptionKey),
        isDefault: true,
      },
    );

    t = await i18next.getFixedT(await i18next.getLocale(request), 'email');
    await mailer.sendMail({
      to: user.email,
      subject: t('new-account.subject'),
      html: render(<NewAccountEmail name={user.username} t={t} />),
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
    successRedirect: `/budgets/${budget.budgetId}`,
    failureRedirect: LOGIN_ROUTE,
  });
}

export default function () {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav />
      </PageHeader>
      <PageBody className="items-start justify-start py-8 md:py-12 lg:py-24">
        <SignupForm />
      </PageBody>
    </div>
  );
}
