import { Button, Heading, Hr, Html, Text } from '@react-email/components';
import type { TFunction } from 'i18next';

import { BASE_URL, emailPreviewTranslate } from '~/services/mail';
import { DATE_TIME_FORMAT } from '~/helpers/dates';

type ShareBudgetProps = {
  authorName: string;
  expiration: Date;
  recipientName: string;
  token: string;
  t: TFunction;
};

export default function ShareBudgetEmail({
  authorName,
  expiration,
  recipientName,
  token,
  t,
}: ShareBudgetProps) {
  return (
    <Html>
      <Heading>{t('share-budget.header', { name: recipientName })}</Heading>
      <Text>{t('share-budget.description', { name: authorName })}</Text>
      <Button href={`${BASE_URL}/budgets/invitations/${token}`}>
        {t('share-budget.accept')}
      </Button>
      <Text>
        {t('share-budget.expiration', {
          expiration,
          formatParams: { expiration: DATE_TIME_FORMAT },
        })}
      </Text>
      <Hr />
      <Text style={{ color: '#aaa' }}>{t('signature')}</Text>
    </Html>
  );
}

const previewProps: ShareBudgetProps = {
  authorName: 'Author',
  expiration: new Date(),
  recipientName: 'Test',
  token: 'test-token',
  t: emailPreviewTranslate,
};
ShareBudgetEmail.PreviewProps = previewProps;
