import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

type PageMainNavProps = {
  children?: ReactNode;
};

export function PageMainNav({ children }: PageMainNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-semibold text-nowrap md:text-base"
      >
        {t('app.name')}
      </Link>
      {children}
    </nav>
  );
}
