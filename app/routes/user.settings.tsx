import { Form, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { authenticatedLoader } from '~/helpers/auth';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { UserMenu } from '~/components/ui/user-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { PageTitle } from '~/components/ui/page-title';
import { PageBody } from '~/components/ui/page-body';
import { PageContent } from '~/components/ui/page-content';
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

export default function () {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav>
          <PageNavLink to="/budgets">{t('nav.budgets')}</PageNavLink>
        </PageMainNav>
        <PageUserNav>
          <UserMenu user={user} />
        </PageUserNav>
      </PageHeader>
      <PageBody>
        <PageTitle>{t('user-settings.title')}</PageTitle>
        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t('user-settings.delete-account.title')}
              </CardTitle>
              <CardDescription>
                {t('user-settings.delete-account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form action="/user/destroy" method="post">
                <Button type="submit" variant="destructive">
                  {t('user-settings.delete-account.submit')}
                </Button>
              </Form>
            </CardContent>
          </Card>
        </PageContent>
      </PageBody>
    </div>
  );
}
