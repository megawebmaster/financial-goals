import { Heading, Hr, Html, Text } from '@react-email/components';
import type { TFunction } from 'i18next';

import { emailPreviewTranslate } from '~/services/mail';

type NewAccountProps = {
  name: string;
  t: TFunction;
};

export default function NewAccount({ name, t }: NewAccountProps) {
  return (
    <Html>
      <Heading>{t('new-account.header', { name })}</Heading>
      <Text>{t('new-account.description')}</Text>
      <Hr />
      <Text style={{ color: '#aaa' }}>{t('signature')}</Text>
    </Html>
  );
}

const previewProps: NewAccountProps = {
  name: 'Test',
  t: emailPreviewTranslate,
};
NewAccount.PreviewProps = previewProps;
