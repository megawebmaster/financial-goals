import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { Form } from '@remix-run/react';

import { authenticator } from '~/services/auth.server';

export const meta: MetaFunction = () => [
  {
    title: 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/dashboard',
  });
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
}

export default function () {
  // TODO: Generate wrapping key on submit
  return (
    <Form method="post">
      <input type="text" name="username" required autoComplete="username" />
      <input type="password" name="password" required autoComplete="password" />
      <button>Sign in!</button>
    </Form>
  );
}
