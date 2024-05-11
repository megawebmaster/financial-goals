import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getToast } from 'remix-toast';
import { toast as notify, Toaster } from 'sonner';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

import i18next from '~/i18n.server';
import './tailwind.css';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  const t = await i18next.getFixedT(await i18next.getLocale(request));
  const { toast, headers } = await getToast(request);

  return json(
    {
      locale,
      title: t('app.name'),
      toast,
    },
    { headers },
  );
}

export default function App() {
  const { locale, toast } = useLoaderData<typeof loader>();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    switch (toast?.type) {
      case 'error':
        notify.error(toast.message);
        break;
      case 'success':
        notify.success(toast.message);
        break;
      case 'warning':
        notify.warning(toast.message);
        break;
      case 'info':
        notify.info(toast.message);
        break;
    }
  }, [toast?.type, toast?.message]);

  z.setErrorMap(makeZodI18nMap({ t, handlePath: { ns: ['zod'] } }));

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
