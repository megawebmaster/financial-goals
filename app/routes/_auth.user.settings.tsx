import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { ConfirmationForm } from '~/components/ui/confirmation-form';

export default function () {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('user-settings.title')} />
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
              confirmation={t('user-settings.delete-account.confirm')}
              description={t(
                'user-settings.delete-account.confirm-description',
              )}
              method="post"
            >
              {t('user-settings.delete-account.submit')}
            </ConfirmationForm>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
