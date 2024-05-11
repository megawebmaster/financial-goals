import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';

import { sessionStorage } from '~/services/session.server';
import { InvalidUsernamePasswordError, login } from '~/services/user.server';
import i18next from '~/i18n.server';

export const authenticator = new Authenticator<number>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, request }) => {
    try {
      const username = form.get('username');
      const password = form.get('password');

      invariant(typeof username === 'string', 'Username must be a string');
      invariant(username.length > 0, 'Username must not be empty');
      invariant(typeof password === 'string', 'Password must be a string');
      invariant(password.length > 0, 'Password must not be empty');

      const user = await login(username, password);

      return user.id;
    } catch (e) {
      if (e instanceof InvalidUsernamePasswordError) {
        const t = await i18next.getFixedT(
          await i18next.getLocale(request),
          'errors',
        );

        throw new Error(t('user.invalid-login'));
      }

      throw e;
    }
  }),
  'user-pass',
);
