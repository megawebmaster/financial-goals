import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';

import { sessionStorage } from '~/services/session.server';
import { login } from '~/services/user.server';

export const authenticator = new Authenticator<number>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get('username');
    const password = form.get('password');

    invariant(typeof username === 'string', 'Username must be a string');
    invariant(username.length > 0, 'Username must not be empty');
    invariant(typeof password === 'string', 'Password must be a string');
    invariant(password.length > 0, 'Password must not be empty');

    const user = await login(username, password);

    return user.id;
  }),
  'user-pass',
);
