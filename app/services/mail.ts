import { initializeI18n } from '~/i18n.server';

export const BASE_URL = process?.env.PUBLIC_URL ?? '';

export const DATE_TIME_FORMAT = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const buildTranslate = (lng: string, ns: string) => {
  const instance = initializeI18n(lng, [ns]);
  return instance.getFixedT(lng, ns);
};
export const emailPreviewTranslate = buildTranslate('en', 'email');
