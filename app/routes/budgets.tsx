import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import { Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { buildWrappingKey } from '~/services/encryption.client';
import { authenticatedLoader } from '~/helpers/auth';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { UserMenu } from '~/components/ui/user-menu';
import { PageNavLink } from '~/components/ui/page-nav-link';

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
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav>
          <PageNavLink to="/budgets/invitations">
            {t('budgets.invitations')}
          </PageNavLink>
        </PageMainNav>
        <PageUserNav>
          <UserMenu user={user} />
        </PageUserNav>
      </PageHeader>
      <main className="flex flex-1 flex-col py-4 px-12">
        <div className="mx-auto w-2/3">
          <Outlet context={user} />
        </div>
      </main>
    </div>
  );
}
