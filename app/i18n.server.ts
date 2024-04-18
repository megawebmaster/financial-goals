import { resolve } from 'node:path';
import { RemixI18Next } from 'remix-i18next/server';
import Backend from 'i18next-fs-backend';

import i18n from '~/i18n';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
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
