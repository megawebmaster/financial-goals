import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from '@remix-run/react';

import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { UserSettingsGeneral } from '~/components/user-settings-general';
import { UserSettingsDelete } from '~/components/user-settings-delete';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('user-settings.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();

  return (
    <>
      <PageTitle title={t('user-settings.page.title')} />
      <PageContent>
        <UserSettingsGeneral user={user} />
        <UserSettingsDelete />
      </PageContent>
    </>
  );
}
