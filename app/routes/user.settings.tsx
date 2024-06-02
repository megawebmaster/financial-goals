import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { INDEX_ROUTE } from '~/routes';
import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';
import { getBudgets } from '~/services/budgets.server';
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
import { PageTitle } from '~/components/ui/page-title';
import { PageBody } from '~/components/ui/page-body';
import { PageContent } from '~/components/ui/page-content';
import { ConfirmationForm } from '~/components/ui/confirmation-form';
import { BudgetsMenu } from '~/components/budgets/budgets-menu';

export const loader = authenticatedLoader(async ({ request }, userId) => {
  try {
    return {
      user: await getUser(userId),
      budgets: await getBudgets(userId),
    };
  } catch (e) {
    return await authenticator.logout(request, {
      redirectTo: INDEX_ROUTE,
    });
  }
});

export default function () {
  const { budgets, user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav>
          <BudgetsMenu budgets={budgets}>{t('nav.budgets')}</BudgetsMenu>
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
              <ConfirmationForm
                action="/user/destroy"
                method="post"
                confirmation={t('user-settings.delete-account.confirm')}
              >
                {t('user-settings.delete-account.submit')}
              </ConfirmationForm>
            </CardContent>
          </Card>
        </PageContent>
      </PageBody>
    </div>
  );
}
