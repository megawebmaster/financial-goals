import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { redirect } from 'react-router';
import { useTranslation } from 'react-i18next';

import i18next from '~/i18n.server';
import { PageHeader } from '~/components/ui/page-header';
import { PageMainNav } from '~/components/ui/page-main-nav';
import { PageUserNav } from '~/components/ui/page-user-nav';
import { LanguageMenu } from '~/components/language-menu';
import { PageBody } from '~/components/ui/page-body';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `404 - ${data.title ?? 'Financial Goals'}` },
    {
      name: 'description',
      content: data.description ?? '404 - Page not found',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await i18next.getLocale(request);
  const t = await i18next.getFixedT(locale);

  return {
    title: t('app.name'),
    description: t('app.404.description'),
  };
};

export function action() {
  return redirect('/');
}

export default function Rest() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader>
        <PageMainNav />
        <PageUserNav>
          <LanguageMenu />
        </PageUserNav>
      </PageHeader>
      <PageBody className="items-start justify-start py-8 md:py-12 lg:py-24">
        <h1 className="text-4xl font-semibold text-center mb-4">
          {t('404.title')}
        </h1>
        <p>{t('404.content')}</p>
        <ul className="list-disc ml-8">
          <li>
            <Link className="hover:underline" to="/login">
              {t('404.items.login')}
            </Link>
          </li>
        </ul>
      </PageBody>
    </div>
  );
}
