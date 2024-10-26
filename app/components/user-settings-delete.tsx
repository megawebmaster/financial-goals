import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { ConfirmationForm } from '~/components/ui/confirmation-form';

export const UserSettingsDelete = () => {
  const { t } = useTranslation();

  return (
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
          description={t('user-settings.delete-account.confirm-description')}
          method="post"
        >
          {t('user-settings.delete-account.submit')}
        </ConfirmationForm>
      </CardContent>
    </Card>
  );
};
