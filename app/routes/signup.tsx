import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { APIError, InvalidRequestTokenError } from '@castleio/sdk';

import { authenticator } from '~/services/auth.server';
import { storeKeyMaterial } from '~/services/encryption.client';
import { createUser, deleteUser } from '~/services/user.server';
import { useCastle } from '~/contexts/CastleContextProvider';
import { castleFilter, castleRisk } from '~/services/castle.server';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Sign up',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/budgets',
  });
}

export async function action({ request }: ActionFunctionArgs) {
  let user;
  const data = await request.clone().formData();

  try {
    const attemptResult = await castleFilter(request, {
      type: '$registration',
      status: '$attempted',
      params: {
        username: data.get('username') as string,
      },
    });

    if (attemptResult.risk > 0.9) {
      console.error('High risk score for attempted user creation!');
      return redirect('/signup');
    }

    user = await createUser(
      data.get('username') as string,
      data.get('password') as string,
    );
    const riskResult = await castleRisk(request, user, {
      type: '$registration',
      status: '$succeeded',
    });

    if (riskResult.risk > 0.9) {
      console.error('High risk score for user account creation!');
      // TODO: Do some additional validation instead of account deletion?
      await deleteUser(user.id);

      return redirect('/signup');
    }
  } catch (e) {
    if (e instanceof InvalidRequestTokenError) {
      console.error('Invalid Castle request token!', e);
      if (user) {
        await deleteUser(user.id);
      }
    } else if (!(e instanceof APIError)) {
      console.error('Unable to create new user', e);
      // TODO: Show some kine of an error?
      try {
        await castleFilter(request, {
          type: '$registration',
          status: '$failed',
          params: {
            username: data.get('username') as string,
          },
        });
      } catch (e) {
        // Do nothing
      }
    }

    if (!(e instanceof APIError)) {
      return redirect('/signup');
    }
  }

  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/budgets',
    failureRedirect: '/',
  });
}

export default function () {
  const castle = useCastle();
  const submit = useSubmit();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = data.get('password');
    const requestToken = await castle?.createRequestToken();
    data.set('requestToken', requestToken || '');

    if (password) {
      await storeKeyMaterial(password.toString());
    }

    submit(data, { method: 'post' });
  };

  return (
    <>
      <h2>Sign up for an account</h2>
      <form method="post" onSubmit={handleSubmit}>
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
        <button type="submit">Create account!</button>
      </form>
    </>
  );
}
