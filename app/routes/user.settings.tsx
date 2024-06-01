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
        <PageMainNav />
        <PageUserNav>
          <UserMenu user={user} />
        </PageUserNav>
      </PageHeader>
      <main className="flex flex-1 flex-col py-4 px-12">
        <div className="mx-auto w-2/3">
          <h1 className="text-4xl font-semibold leading-none tracking-tight mt-4 mb-8">
            {t('user-settings.title')}
          </h1>
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
        </div>
      </main>
    </div>
  );
}
