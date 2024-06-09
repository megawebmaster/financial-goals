import { resolve } from 'node:path';
import { createCookie } from '@remix-run/node';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next/server';
import Backend from 'i18next-fs-backend';

import { config } from '~/config.server';
import i18n from '~/i18n';

export const languageCookie = createCookie('language', {
  sameSite: 'lax',
  path: '/',
  httpOnly: true,
  secrets: [config.session.secret],
  secure: process.env.NODE_ENV === 'production',
});

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: languageCookie,
    order: ['cookie', 'header'],
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
  },
  plugins: [Backend],
});

export default i18next;

export const initializeI18n = (lng: string, ns: string[]) => {
  const instance = createInstance();
  instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...i18n,
      lng,
      ns,
      backend: { loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json') },
      initImmediate: false,
    });

  return instance;
};
