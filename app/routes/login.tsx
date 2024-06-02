import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { INDEX_ROUTE, LOGIN_ROUTE } from '~/routes';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageBody } from '~/components/ui/page-body';
import { LoginForm } from '~/components/login-form';
import i18next from '~/i18n.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (userId) {
    // TODO: Add support for redirecting back
    return redirect(INDEX_ROUTE);
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('login.title'),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: INDEX_ROUTE,
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
        <LoginForm />
      </PageBody>
    </div>
  );
}
