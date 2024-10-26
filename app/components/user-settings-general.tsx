import type { User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { useSubmit } from '@remix-run/react';
import { encrypt, importKey } from '~/services/encryption';
import type { UserSettingsGeneralFormValues } from '~/components/user-settings/user-settings-general-form';
import { UserSettingsGeneralForm } from '~/components/user-settings/user-settings-general-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

type UserSettingsProps = {
  user: User;
};

export const UserSettingsGeneral = ({ user }: UserSettingsProps) => {
  const { t } = useTranslation();
  const submit = useSubmit();
  const handleSubmit = async (values: UserSettingsGeneralFormValues) => {
    const publicKey = await importKey(user.publicKey, ['encrypt']);

    submit(
      {
        preferredLocale: await encrypt(values.preferredLocale, publicKey),
      },
      { action: '/user/update', method: 'post' },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {t('user-settings.general.title')}
        </CardTitle>
        <CardDescription>
          {t('user-settings.general.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserSettingsGeneralForm onSubmit={handleSubmit} user={user} />
      </CardContent>
    </Card>
  );
};
