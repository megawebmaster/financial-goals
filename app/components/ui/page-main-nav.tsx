import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PageNavLink } from '~/components/ui/page-nav-link';

type PageMainNavProps = {
  children?: ReactNode;
};

export function PageMainNav({ children }: PageMainNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <PageNavLink to="/" className="text-lg font-semibold">
        {t('app.name')}
      </PageNavLink>
      {children}
    </nav>
  );
}
