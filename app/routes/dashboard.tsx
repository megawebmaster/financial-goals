import type {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import StatusCodes from 'http-status-codes';

import { authenticator } from '~/services/auth.server';
import { getUser } from '~/services/user.server';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals - Dashboard',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    return redirect('/', StatusCodes.BAD_REQUEST);
  }

  return {
    user: await getUser(userId),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/',
  });
}

export default function () {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <p>Logged in as: {data.user.username}</p>
      <Form method="post">
        <button>Log out</button>
      </Form>
    </>
  );
}
