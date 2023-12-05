import { createCookieSessionStorage } from '@remix-run/node';

import { config } from '~/config.server';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [config.session.secret],
    secure: process.env.NODE_ENV === 'production',
  },
});
