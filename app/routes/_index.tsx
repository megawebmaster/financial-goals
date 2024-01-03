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
import { castleFilter, castleRisk } from '~/services/castle.server';
import { getUser } from '~/services/user.server';
import { sessionStorage } from '~/services/session.server';
import { useCastle } from '~/contexts/CastleContextProvider';

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
  const data = await request.clone().formData();

  try {
    const attemptResult = await castleFilter(request, {
      type: '$login',
      status: '$attempted',
      params: {
        username: data.get('username') as string,
      },
    });

    if (attemptResult.risk > 0.9) {
      console.error('High risk score for attempted user login!');
      return redirect('/');
    }

    const userId = await authenticator.authenticate(
      'user-pass',
      request.clone(),
      {
        throwOnError: true,
      },
    );

    const riskResult = await castleRisk(request, await getUser(userId), {
      type: '$login',
      status: '$succeeded',
    });

    if (riskResult.risk > 0.9) {
      console.error('High risk score for successful user login!');
      return redirect('/');
    }

    // Update the session and redirect to user dashboard
    const session = await sessionStorage.getSession(
      request.headers.get('cookie'),
    );
    // and store the user data
    session.set(authenticator.sessionKey, userId);

    // commit the session
    const headers = new Headers({
      'Set-Cookie': await sessionStorage.commitSession(session),
    });

    return redirect('/budgets', { headers });
  } catch (e) {
    if (e instanceof InvalidRequestTokenError) {
      console.error('Invalid Castle request token!', e);
    }

    if (!(e instanceof APIError)) {
      try {
        await castleFilter(request, {
          type: '$login',
          status: '$failed',
          params: {
            username: data.get('username') as string,
          },
        });
      } catch (e) {
        // Do nothing
      }
    }

    return redirect('/');
  }
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
      <form onSubmit={handleSubmit}>
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
      </form>
      <a href="/signup">Sign up</a>
    </>
  );
}
