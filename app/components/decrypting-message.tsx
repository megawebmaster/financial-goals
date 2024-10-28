import { useTranslation } from 'react-i18next';

import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent } from '~/components/ui/card';

export function DecryptingMessage() {
  const { t } = useTranslation();

  return (
    <PageContent>
      <Card>
        <CardContent className="pt-6 text-center">
          {t('component.decrypting-message.text')}
        </CardContent>
      </Card>
    </PageContent>
  );
}
