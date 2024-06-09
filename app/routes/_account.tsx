import { Outlet } from '@remix-run/react';

import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageBody } from '~/components/ui/page-body';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { LanguageMenu } from '~/components/language-menu';

export default function () {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav />
        <PageUserNav>
          <LanguageMenu />
        </PageUserNav>
      </PageHeader>
      <PageBody className="items-start justify-start py-8 md:py-12 lg:py-24">
        <Outlet />
      </PageBody>
    </div>
  );
}
