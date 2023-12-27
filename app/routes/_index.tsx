import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { Form } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';
import { storeKeyMaterial } from '~/services/encryption.client';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/budgets',
  });
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets',
    failureRedirect: '/',
  });
}

export default function () {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const password = data.get('password');

    if (password) {
      await storeKeyMaterial(password.toString());
    }
  };

  return (
    <>
      <Form method="post" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          required
          autoComplete="username"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="password"
        />
        <button type="submit">Sign in!</button>
      </Form>
      <a href="/signup">Sign up</a>
    </>
  );
}
