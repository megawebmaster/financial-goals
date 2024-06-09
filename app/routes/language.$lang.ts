import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { equals } from 'ramda';

import { languageCookie } from '~/i18n.server';
import i18n from '~/i18n';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const currentLanguage =
    i18n.supportedLngs.find(equals(params.lang)) || i18n.fallbackLng;

  const referer =
    request.headers.get('referer') || request.headers.get('Referer') || '/';

  return redirect(referer, {
    headers: { 'Set-Cookie': await languageCookie.serialize(currentLanguage) },
  });
}
